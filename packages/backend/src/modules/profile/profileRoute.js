import express from 'express';
import ProfileController from './profileController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

import { uploadAvatar } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.get('/me', ProfileController.getProfile);

router.put('/me', ProfileController.updateProfile);

router.get('/me/matches', ProfileController.getMatchHistory);
router.post('/avatar', uploadAvatar.single('avatar'), ProfileController.uploadAvatar);

export default router;
