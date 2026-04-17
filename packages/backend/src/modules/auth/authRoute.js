import express from 'express';
import authMiddleware from '../../middleware/authMiddleware.js';
import authController from './authController.js';
import usersController from './usersController.js';

const router = express.Router();

// Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Identity Routes
router.get('/me', authMiddleware, usersController.getMe);

export default router;
