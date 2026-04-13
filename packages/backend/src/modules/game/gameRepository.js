import { GameSession } from './gameModel.js';


class GameRepository {
  async createSession(sessionData) {
    return await GameSession.create(sessionData);
  }

  async findById(sessionId) {
    return await GameSession.findById(sessionId)
      .populate('player1Id', 'username avatar')
      .populate('player2Id', 'username avatar')
      .lean();
  }

  async recordMove(sessionId, { move, nextBoard, nextTurn }) {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $push: { moves: move },
        $set: { 
          boardState: nextBoard,
          currentTurn: nextTurn 
        }
      },
      { new: true }
    );
  }

  async recordMoves(sessionId, { moves, nextBoard, nextTurn }) {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $push: { moves: { $each: moves } },
        $set: { 
          boardState: nextBoard,
          currentTurn: nextTurn 
        }
      },
      { new: true }
    );
  }

  async completeGame(sessionId, { status, winnerId, winLine, endTime }) {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status,
          winnerId,
          winLine,
          endTime: endTime || new Date()
        }
      },
      { new: true }
    );
  }

  async findActiveSessionByPlayer(userId) {
    return await GameSession.findOne({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: 'ACTIVE'
    }).lean();
  }

  async findPlayerHistory(userId, limit = 10) {
    return await GameSession.find({
      $or: [{ player1Id: userId }, { player2Id: userId }]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  }
}

export default new GameRepository();
