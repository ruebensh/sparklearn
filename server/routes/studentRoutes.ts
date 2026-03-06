import express from 'express';
import { protect } from '../middleware/auth.js';
import { saveOnboarding, getProfile, getBooks, chat, getSessions, getSession, generateQuiz, submitQuiz, getProgress } from '../controllers/studentController.js';

const router = express.Router();

router.post('/onboarding', protect, saveOnboarding);
router.get('/profile', protect, getProfile);
router.get('/books', protect, getBooks);
router.post('/chat', protect, chat);
router.post('/quiz/generate', protect, generateQuiz);
router.post('/quiz/submit', protect, submitQuiz);
router.get('/progress', protect, getProgress);
router.get('/progress/:studentId', protect, getProgress);

export default router;

router.get('/sessions', protect, getSessions);
router.get('/sessions/:sessionId', protect, getSession);
