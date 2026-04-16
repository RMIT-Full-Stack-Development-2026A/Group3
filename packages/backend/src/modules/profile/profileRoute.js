import express from 'express';
import profileController from './profileController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Endpoint lấy thông tin hồ sơ
router.get('/me', profileController.getProfile);

// Endpoint cập nhật thông tin hồ sơ
router.put('/me', profileController.updateProfile);

router.get('/matches', profileController.getMatchHistory);

export default router;
