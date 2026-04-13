import gameRepository from './gameRepository.js';
import GameDTO from './gameDto.js';
import { getBestMove } from '../../shared/utils/aiLogicUtil.js';
import { checkWin, isValidMove, isBoardFull } from '../../shared/utils/gameLogicUtil.js';

class GameService {
  /**
   * Khởi tạo ván đấu mới
   */
  async startGame(userId, gameData) {
    const activeSession = await gameRepository.findActiveSessionByPlayer(userId);
    if (activeSession) {
      return GameDTO.transformGameSession(activeSession, userId);
    }

    const size = gameData.boardSize;
    const initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    
    const newSession = await gameRepository.createSession({
      ...gameData,
      player1Id: userId,
      boardState: initialBoard,
      currentTurn: 'PLAYER1',
      status: 'ACTIVE'
    });

    return GameDTO.transformGameSession(newSession, userId);
  }

  async makeMove(sessionId, userId, { x, y }) {
    const session = await gameRepository.findById(sessionId);
    if (!session || session.status !== 'ACTIVE') {
      throw new Error('Game not found or game has ended');
    }

    const isP1 = session.player1Id._id.toString() === userId.toString();
    const currentTurnLabel = isP1 ? 'PLAYER1' : 'PLAYER2';
    
    if (session.currentTurn !== currentTurnLabel) {
      throw new Error('It\'s not your turn');
    }

    if (!isValidMove(session.boardState, y, x)) {
      throw new Error('Invalid move');
    }

    const playerMarker = isP1 ? session.player1Marker : session.player2Marker;
    const board = session.boardState;

    board[y][x] = playerMarker;
    const playerMove = {
      step: session.moves.length + 1,
      pId: userId,
      x, y,
      marker: playerMarker
    };

    const playerWin = checkWin(board, y, x, playerMarker);
    if (playerWin.win) {
      await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: currentTurnLabel });
      const finalSession = await gameRepository.completeGame(sessionId, {
        status: 'COMPLETED',
        winnerId: userId,
        winLine: playerWin.winLine
      });
      return GameDTO.transformGameSession(finalSession, userId);
    }

    if (isBoardFull(board)) {
      await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: currentTurnLabel });
      const finalSession = await gameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
      return GameDTO.transformGameSession(finalSession, userId);
    }

    if (session.gameType === 'SINGLE') {
      const aiMarker = isP1 ? session.player2Marker : session.player1Marker;
      const bestMove = getBestMove(board, session.difficulty, aiMarker, playerMarker);
      
      board[bestMove.row][bestMove.col] = aiMarker;
      const aiMove = {
        step: session.moves.length + 2,
        pId: null,
        x: bestMove.col,
        y: bestMove.row,
        marker: aiMarker
      };

      const aiWin = checkWin(board, bestMove.row, bestMove.col, aiMarker);
      
      const updatedSession = await gameRepository.recordMoves(sessionId, { 
        moves: [playerMove, aiMove], 
        nextBoard: board, 
        nextTurn: 'PLAYER1' 
      });

      if (aiWin.win) {
        const finalSession = await gameRepository.completeGame(sessionId, {
          status: 'COMPLETED',
          winnerId: null, // AI win
          winLine: aiWin.winLine
        });
        return GameDTO.transformGameSession(finalSession, userId);
      }

      if (isBoardFull(board)) {
        const finalSession = await gameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
        return GameDTO.transformGameSession(finalSession, userId);
      }

      return GameDTO.transformGameSession(updatedSession, userId);
    }

    // online/local mode
    const nextTurn = isP1 ? 'PLAYER2' : 'PLAYER1';
    const updatedSession = await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: nextTurn });
    return GameDTO.transformGameSession(updatedSession, userId);
  }

  async getGameById(sessionId, userId) {
    const session = await gameRepository.findById(sessionId);
    if (!session) throw new Error('Game not found');

    const p1Id = session.player1Id?._id?.toString() || session.player1Id?.toString();
    const p2Id = session.player2Id?._id?.toString() || session.player2Id?.toString();
    const currentUserId = userId.toString();

    if (p1Id !== currentUserId && p2Id !== currentUserId) {
      throw new Error('You do not have permission to access this match');
    }

    return GameDTO.transformGameSession(session, userId);
  }

  async getPlayerHistory(userId, limit) {
    const safeLimit = Math.min(limit, 50);
    const sessions = await gameRepository.findPlayerHistory(userId, safeLimit);
    return GameDTO.transformHistoryList(sessions, userId);
  }
}

export default new GameService();
