import express from 'express';
import { getProgress, getStudentProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getProgress);
router.get('/student/:studentId', getStudentProgress);

export default router;