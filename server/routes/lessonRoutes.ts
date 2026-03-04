import express from 'express';
import {
  createLesson, getLessons, getLessonById,
  deleteLesson, assignLesson, explainLesson,
  generateQuiz, submitQuiz, upload
} from '../controllers/lessonController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Hammasi protected

router.get('/', getLessons);
router.get('/:id', getLessonById);
router.post('/', upload.single('pdf'), createLesson);
router.delete('/:id', deleteLesson);
router.post('/:id/assign', assignLesson);
router.post('/:id/explain', explainLesson);
router.post('/:id/quiz', generateQuiz);
router.post('/:id/quiz/submit', submitQuiz);

export default router;