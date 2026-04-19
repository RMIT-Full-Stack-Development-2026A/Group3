import express from 'express';
import GameController from './gameController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.post('/local', GameController.syncLocalMatch);
router.get('/history', GameController.getMatchHistory);
router.post('/sessions', GameController.startGame);
router.get('/sessions/:sessionId', GameController.getGame);
router.post('/sessions/:sessionId/move', GameController.makeMove);

export default router;
