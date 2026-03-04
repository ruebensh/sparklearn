import express from 'express';
import { submitContact, getInquiries } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', getInquiries); // Admin only

export default router;
