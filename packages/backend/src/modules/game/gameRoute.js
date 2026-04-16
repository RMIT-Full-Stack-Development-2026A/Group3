import express from 'express';
import GameController from './gameController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * Game Routes - Defines endpoints for the Tic-Tac-Toe engine
 */

router.post('/create', GameController.startGame);

// 3. Sync finished local match results
// POST /api/v1/game/sync-local
router.post('/sync-local', GameController.syncLocalMatch);

// 4. Match history list with search/filter/sort/pagination
// GET /api/v1/game/history
router.get('/history', GameController.getMatchHistory);
router.post('/:sessionId/move', GameController.makeMove);

export default router;

