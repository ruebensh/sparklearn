import { Response } from 'express';

export const success = (res: Response, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const error = (res: Response, message = 'Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
