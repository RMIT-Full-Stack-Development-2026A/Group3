import express from 'express';
import ProfileController from './profileController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.get('/me', ProfileController.getProfile);

router.put('/me', ProfileController.updateProfile);

router.get('/me/matches', ProfileController.getMatchHistory);

export default router;
