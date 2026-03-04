import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { error } from '../utils/apiResponse.js';

const JWT_SECRET = process.env.JWT_SECRET || 'crisis-classroom-secret-key';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401);
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Access denied', 403);
    }
    next();
  };
};