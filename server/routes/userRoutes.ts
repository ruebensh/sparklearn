import express from 'express';
import { getProfile, updateProfile, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/', getAllUsers); // Admin only

export default router;
