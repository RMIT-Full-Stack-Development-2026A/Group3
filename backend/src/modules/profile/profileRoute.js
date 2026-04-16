import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import { profileController } from './profileController.js';

const router = express.Router();

router.get('/me', authMiddleware, profileController.getMyProfile);

export default router;
