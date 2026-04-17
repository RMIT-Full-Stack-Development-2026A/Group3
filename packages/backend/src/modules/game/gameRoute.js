import express from 'express';
import gameController from './gameController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/start', gameController.startGame);

router.get('/:sessionId', gameController.getGame);

router.post('/sync-local', gameController.syncLocalMatch);

router.post('/:sessionId/move', gameController.makeMove);

export default router;
