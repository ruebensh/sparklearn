import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/apiResponse.js';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(err.message, err.stack);
  error(res, err.message, statusCode, process.env.NODE_ENV === 'production' ? null : err.stack);
};

export default errorHandler;
