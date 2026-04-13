import express from 'express';
import gameController from './gameController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/start', gameController.startGame);

router.get('/history/me', gameController.getMyHistory);

router.get('/:sessionId', gameController.getGame);

router.post('/move/:sessionId', gameController.makeMove);

export default router;
