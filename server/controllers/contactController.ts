import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse.js';

export const submitContact = async (req: Request, res: Response) => {
  // 1. Validate input
  // 2. Save to database
  // 3. Send email notification
  success(res, null, 'Contact inquiry submitted', 201);
};

export const getInquiries = async (req: Request, res: Response) => {
  // 1. Fetch all inquiries (admin only)
  success(res, [], 'Inquiries fetched');
};
