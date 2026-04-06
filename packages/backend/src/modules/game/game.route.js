import express from 'express';
import GameController from './game.controller.js';

const router = express.Router();

/**
 * Game Routes - Defines endpoints for the Tic-Tac-Toe engine
 */

// 1. Initialize a new game session
// POST /api/v1/game/start
router.post('/start', GameController.startGame);

// 2. Handle a player's move in AI Mode
// POST /api/v1/game/move
router.post('/move', GameController.makeMove);

// 3. Sync finished local match results
// POST /api/v1/game/sync-local
router.post('/sync-local', GameController.syncLocalMatch);

export default router;
