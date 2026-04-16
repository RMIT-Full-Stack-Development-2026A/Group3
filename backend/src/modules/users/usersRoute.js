import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import { usersController } from './usersController.js';

const router = express.Router();

router.get('/me', authMiddleware, usersController.getMe);

export default router;
