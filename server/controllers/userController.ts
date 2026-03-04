import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse.js';

export const getProfile = async (req: Request, res: Response) => {
  // 1. Fetch user by ID from req.user
  success(res, { id: 'mock-id', name: 'Mock User' }, 'Profile fetched');
};

export const updateProfile = async (req: Request, res: Response) => {
  // 1. Update user fields
  success(res, { id: 'mock-id', name: 'Updated User' }, 'Profile updated');
};

export const getAllUsers = async (req: Request, res: Response) => {
  // 1. Fetch all users (admin only)
  success(res, [], 'Users fetched');
};
