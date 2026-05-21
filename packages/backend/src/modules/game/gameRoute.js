import express from 'express';
import GameController from './gameController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';
import { RoleMiddleware } from '../../middleware/roleMiddleware.js';
import premiumMiddleware from '../../middleware/premiumMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.post('/local', GameController.syncLocalMatch);
router.get('/history', GameController.getMatchHistory);
router.get('/sessions/:sessionId', GameController.getGame);
router.post('/sessions/:sessionId/move', GameController.makeMove);
router.get(
	'/:id/replay',
	RoleMiddleware('PLAYER', 'ADMIN'),
	premiumMiddleware,
	GameController.getReplaySession
);

export default router;
