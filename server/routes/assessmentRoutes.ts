import express from 'express';
import { getQuiz, submitAnswers } from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/lesson/:lessonId', getQuiz);
router.post('/submit', submitAnswers);

export default router;
