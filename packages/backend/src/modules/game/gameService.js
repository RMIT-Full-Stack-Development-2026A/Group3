import GameRepository from './gameRepository.js';

class GameService {

  async getGameById(sessionId, userId) {
    const session = await GameRepository.findById(sessionId);
    if (!session) throw new Error('Game not found');

    const p1Id = session.player1Id?._id?.toString() || session.player1Id?.toString();
    const p2Id = session.player2Id?._id?.toString() || session.player2Id?.toString();
    const currentUserId = userId.toString();

    if (p1Id !== currentUserId && p2Id !== currentUserId) {
      throw new Error('You do not have permission to access this match');
    }

    return session;
  }

  async getMatchHistory (historyQuery) {
    return await GameRepository.getPaginatedMatchHistory(historyQuery);
  }

  async syncLocalMatch(syncData) {
    return await GameRepository.createSession(syncData);
  }

  async getReplaySession(sessionId, user) {
    const session = await GameRepository.findById(sessionId);

    if (!session) {
      const error = new Error('Game session not found.');
      error.statusCode = 404;
      error.errorCode = 'GAME_SESSION_NOT_FOUND';
      throw error;
    }

    const userId = String(user && user.id ? user.id : '');
    const role = String(user && user.role ? user.role : '').toUpperCase();

    if (!userId) {
      const error = new Error('User context not found.');
      error.statusCode = 401;
      error.errorCode = 'TOKEN_MISSING';
      throw error;
    }

    if (role !== 'ADMIN') {
      const p1Id = session.player1Id?._id?.toString() || session.player1Id?.toString();
      const p2Id = session.player2Id?._id?.toString() || session.player2Id?.toString();
      const isPlayer = [p1Id, p2Id].filter(Boolean).some((playerId) => playerId === userId);

      if (!isPlayer) {
        const error = new Error('You are not allowed to view this replay.');
        error.statusCode = 403;
        error.errorCode = 'REPLAY_FORBIDDEN';
        throw error;
      }
    }

    return session;
  }
}

export default new GameService();