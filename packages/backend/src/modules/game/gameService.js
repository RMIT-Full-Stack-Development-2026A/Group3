import GameRepository from './gameRepository.js';
import { checkWin, isValidMove, isBoardFull } from '@tictactoang/shared';
import ProfileRepository from '../profile/profileRepository.js';

class GameService {

  async makeMove(sessionId, userId, { x, y }) {
    const session = await GameRepository.findById(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      throw new Error('Game not found or game has ended');
    }

    const p1Id = session.player1Id?._id?.toString();
    const p2Id = session.player2Id?._id?.toString();
    const currentUserId = userId.toString();

    if (currentUserId !== p1Id && currentUserId !== p2Id) {
      throw new Error('You do not have permission to play in this match');
    }

    const isP1 = p1Id === currentUserId;
    const currentTurnLabel = isP1 ? 'PLAYER1' : 'PLAYER2';

    if (session.currentTurn !== currentTurnLabel) {
      throw new Error('It\'s not your turn');
    }

    if (!isValidMove(session.boardState, y, x)) {
      throw new Error('Invalid move');
    }

    const playerMarker = isP1 ? session.player1Marker : session.player2Marker;
    const board = [...session.boardState.map(row => [...row])];
    board[y][x] = playerMarker;

    session.boardState = board;

    const playerMove = {
      step: session.moves.length + 1,
      pId: userId,
      x, y,
      marker: playerMarker,
      time: new Date()
    };

    const playerWin = checkWin(board, y, x, playerMarker);
    if (playerWin.win) {
      await GameRepository.recordMoves(sessionId, { moves: [playerMove], nextBoard: board, nextTurn: session.currentTurn });
      const finalSession = await GameRepository.completeGame(sessionId, {
        status: 'COMPLETED',
        winnerId: userId,
        winLine: playerWin.winLine
      });

      // Update Winner Stats (Online mode only)
      await ProfileRepository.updateStatsByUserId(userId, { totalGames: 1, wins: 1, eloRating: 25 });
      
      // Update Loser Stats
      const loserId = isP1 ? p2Id : p1Id;
      if (loserId) {
        await ProfileRepository.updateStatsByUserId(loserId, { totalGames: 1, losses: 1, eloRating: -25 });
      }

      return finalSession;
    }

    if (isBoardFull(board)) {
      await GameRepository.recordMoves(sessionId, { moves: [playerMove], nextBoard: board, nextTurn: currentTurnLabel });
      const finalSession = await GameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });

      // Update Draw Stats for both players (Online mode only)
      if (p1Id) await ProfileRepository.updateStatsByUserId(p1Id, { totalGames: 1, draws: 1 });
      if (p2Id) await ProfileRepository.updateStatsByUserId(p2Id, { totalGames: 1, draws: 1 });

      return finalSession;
    }

    const nextTurn = isP1 ? 'PLAYER2' : 'PLAYER1';
    const updatedSession = await GameRepository.recordMoves(sessionId, { moves: [playerMove], nextBoard: board, nextTurn: nextTurn });
    return updatedSession;
  }

  async getGameById(sessionId, userId) {
    const session = await GameRepository.findById(sessionId);
    if (!session) throw new Error('Game not found');

    const p1Id = session.player1Id?._id?.toString();
    const p2Id = session.player2Id?._id?.toString();
    const currentUserId = userId.toString();

    if (p1Id !== currentUserId && p2Id !== currentUserId) {
      throw new Error('You do not have permission to access this match');
    }

    return session;
  }

  async getMatchHistory(historyQuery) {
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
      const p1Id = session.player1Id?._id?.toString();
      const p2Id = session.player2Id?._id?.toString();
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