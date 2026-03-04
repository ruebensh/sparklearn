import express from 'express';
import { register, login, logout, refreshToken, createStudent } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);         // Parent ro'yxatdan o'tishi
router.post('/login', login);               // Parent (email) yoki Student (username)
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Protected — faqat parent
router.post('/create-student', protect, createStudent);  // Parent farzand login yaratadi

export default router;