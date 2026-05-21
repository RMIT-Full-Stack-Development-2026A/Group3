/** arena route */
import express from 'express';
import ArenaController from './arenaController.js';
import AuthMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(AuthMiddleware);

router.post('/rooms', ArenaController.createRoom);
router.get('/rooms', ArenaController.listRooms);
router.post('/rooms/:code/join', ArenaController.joinRoom);

export default router;
