import express from 'express';
import { success } from '../utils/apiResponse.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import lessonRoutes from './lessonRoutes.js';
import progressRoutes from './progressRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import contactRoutes from './contactRoutes.js';
import studentRoutes from './studentRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  success(res, null, 'API is running');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/lessons', lessonRoutes);
router.use('/progress', progressRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/contact', contactRoutes);
router.use('/student', studentRoutes);

export default router;
