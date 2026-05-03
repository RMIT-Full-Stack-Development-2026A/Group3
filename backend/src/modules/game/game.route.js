/** game route */
const express = require('express');
const gameController = require('./game.controller');
const premiumMiddleware = require('../../middleware/premiumMiddleware');

const router = express.Router();

router.get('/:id/replay', premiumMiddleware, gameController.getReplaySession);

module.exports = router;
