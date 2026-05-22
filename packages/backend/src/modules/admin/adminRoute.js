import express from 'express';
import AdminController from './adminController.js';
import AuthMiddleware, { AdminMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and Admin privileges
router.use(AuthMiddleware, AdminMiddleware);

/**
 * @route   GET /api/admin/users
 * @desc    Get a list of all users
 * @access  Private (Admin)
 */
router.get('/users', AdminController.getUsers);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Ban or Unban a user account
 * @access  Private (Admin)
 */
router.patch('/users/:id/status', AdminController.updateUserStatus);

/**
 * @route   GET /api/admin/rooms
 * @desc    Get a list of game rooms with search and pagination
 * @access  Private (Admin)
 */
router.get('/rooms', AdminController.getRooms);

/**
 * @route   POST /api/admin/rooms/:id/close
 * @desc    Force-close a game room and abort the active match
 * @access  Private (Admin)
 */
router.post('/rooms/:id/close', AdminController.closeRoom);

export default router;
