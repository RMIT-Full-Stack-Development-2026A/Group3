import express from 'express';
import profileController from './profileController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/me', profileController.getProfile);

router.put('/me', profileController.updateProfile);

router.get('/me/matches', profileController.getMatchHistory);

export default router;
