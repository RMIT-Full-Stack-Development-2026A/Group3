import express from 'express';
import AdminController from './adminController.js';
import AuthMiddleware, { AdminMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả các route admin đều yêu cầu đăng nhập và quyền Admin
router.use(AuthMiddleware, AdminMiddleware);

/**
 * @route   GET /api/admin/users
 * @desc    Lấy danh sách tất cả người chơi
 * @access  Private (Admin)
 */
router.get('/users', AdminController.getUsers);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Khóa/Mở khóa tài khoản người chơi
 * @access  Private (Admin)
 */
router.patch('/users/:id/status', AdminController.updateUserStatus);

export default router;
