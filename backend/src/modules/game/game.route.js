/** game route */
const express = require('express');
const gameController = require('./game.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const premiumMiddleware = require('../../middleware/premiumMiddleware');

const router = express.Router();

router.get(
	'/:id/replay',
	authMiddleware,
	roleMiddleware('PLAYER', 'ADMIN'),
	premiumMiddleware,
	gameController.getReplaySession
);

module.exports = router;
