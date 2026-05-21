import mongoose from 'mongoose';
import GameService from './gameService.js';
import GameDTO from './gameDto.js';
import { responseHelper } from '../../common/responseHelper.js';
import { getIO } from '@tictactoang/shared/utils/socketManager.js';

const { sendSuccess, sendError } = responseHelper;

class GameController {

  async makeMove(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const moveData = GameDTO.toMoveReq(req.body);

      const session = await GameService.makeMove(sessionId, userId, moveData);
      const data = GameDTO.toGameSession(session, userId);

      try {
        const io = getIO();
        if (io) {
          const roomCode = session.roomId?.roomCode;
          if (roomCode) {
            io.to(`room-${roomCode}`).emit('game:move', { session: data });
            console.log(`[gameController] Emitted game:move to room-${roomCode}`);
          } else {
            io.emit('game:move', { session: data });
          }
        }
      } catch (emitErr) {
        console.error('Failed to emit game move event:', emitErr);
      }

      return sendSuccess(res, 200, data, 'Move recorded');
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      return sendError(res, statusCode, 'INVALID_MOVE', error.message);
    }
  }

  async getGame(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await GameService.getGameById(sessionId, userId);
      const data = GameDTO.toGameSession(session, userId);

      return sendSuccess(res, 200, data, 'Game fetched successfully');
    } catch (error) {
      const statusCode = error.message.includes('permission') ? 403 : 404;
      return sendError(res, statusCode, 'GAME_FETCH_FAILED', error.message);
    }
  }

  async syncLocalMatch(req, res) {
    try {
      const userId = req.user.id;
      const syncData = GameDTO.toLocalReq({ ...req.body, p1Id: userId });

      const session = await GameService.syncLocalMatch(syncData);
      const data = GameDTO.toGameSession(session, userId);

      return sendSuccess(res, 201, data, 'Offline match synced successfully');
    } catch (error) {
      return sendError(res, 400, 'SYNC_FAILED', error.message);
    }
  }

  async getMatchHistory(req, res) {
    try {
      const userId = req.user.id;
      const query = GameDTO.toHistoryQuery(userId, req.query);

      const history = await GameService.getMatchHistory(query);
      const data = GameDTO.toHistoryRes(history);

      return sendSuccess(res, 200, data, 'History fetched successfully');
    } catch (error) {
      return sendError(res, 400, 'HISTORY_FETCH_FAILED', error.message);
    }
  }

  async getReplaySession(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'INVALID_GAME_ID', 'Game id is invalid.');
      }

      const session = await GameService.getReplaySession(id, req.user);
      const data = GameDTO.toReplayResponse(session);

      return sendSuccess(res, 200, data, 'Replay session loaded');
    } catch (error) {
      return sendError(
        res,
        error.statusCode || 500,
        error.errorCode || 'REPLAY_SESSION_ERROR',
        error.message || 'Unable to load replay session'
      );
    }
  }
}

export default new GameController();
