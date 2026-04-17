import express from 'express';
import AuthMiddleware from '../../middleware/authMiddleware.js';
import AuthController from './authController.js';
import UsersController from '../users/usersController.js';

const router = express.Router();

// Authentication Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Identity Routes
router.get('/me', AuthMiddleware, UsersController.getMe);

export default router;
