/** game route */
import express from 'express';
import gameController from './game.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import roleMiddleware from '../../middleware/roleMiddleware.js';
import premiumMiddleware from '../../middleware/premiumMiddleware.js';

const router = express.Router();

router.get(
	'/:id/replay',
	authMiddleware,
	roleMiddleware('PLAYER', 'ADMIN'),
	premiumMiddleware,
	gameController.getReplaySession
);

export default router;
