import { GameSession } from './game.model.js';

/**
 * Game Repository - Handles all direct MongoDB operations for Game Sessions
 */
const GameRepository = {
  /**
   * Create a new game session in the database
   */
  createSession: async (sessionData) => {
    const session = new GameSession(sessionData);
    return await session.save();
  },

  /**
   * Retrieve a game session by its ID
   */
  getSessionById: async (id) => {
    return await GameSession.findById(id);
  },

  /**
   * Add a move and update the board state of a session
   */
  updateSessionBoard: async (sessionId, move, newBoardState) => {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $push: { moves: move },
        $set: { boardState: newBoardState }
      },
      { new: true }
    );
  },

  /**
   * Update the final status and winner of a session
   */
  updateSessionStatus: async (sessionId, status, winnerId, winLine = []) => {
    return await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status,
          winnerId,
          winLine
        }
      },
      { new: true }
    );
  }
};

export default GameRepository;
