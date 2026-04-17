import express from 'express';
import GameController from './gameController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.post('/start', GameController.startGame);

router.get('/:sessionId', GameController.getGame);

router.post('/sync-local', GameController.syncLocalMatch);

router.post('/:sessionId/move', GameController.makeMove);

export default router;
