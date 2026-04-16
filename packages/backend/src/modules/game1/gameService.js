import gameRepository from './gameRepository.js';
import GameDTO from './gameDto.js';
import authService from '../auth/authService.js';
import { getBestMove } from '@tictactoang/shared/utils/aiLogicUtil.js';
import { checkWin, isValidMove, isBoardFull } from '@tictactoang/shared/utils/gameLogicUtil.js';

class GameService {
  /**
   * Khởi tạo ván đấu mới
   */
  async startGame(userId, gameData) {
    // Check for existing active session to prevent duplicates
    const activeSession = await gameRepository.findActiveSessionByPlayer(userId);
    if (activeSession) {
      return GameDTO.transformGameSession(activeSession, userId);
    }

const directions = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
];

const isWithinBounds = (board, row, col) => {
  return row >= 0 && col >= 0 && row < board.length && col < board.length;
};

const isBoardFull = (board) => {
  return board.every((r) => r.every((cell) => cell !== null));
};

const checkWin = (board, row, col, marker) => {
  for (const [dr, dc] of directions) {
    const line = [{ x: col, y: row }];

    let r = row + dr;
    let c = col + dc;
    while (isWithinBounds(board, r, c) && board[r][c] === marker) {
      line.push({ x: c, y: r });
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = col - dc;
    while (isWithinBounds(board, r, c) && board[r][c] === marker) {
      line.unshift({ x: c, y: r });
      r -= dr;
      c -= dc;
    }

    if (line.length >= 5) {
      return { win: true, winLine: line.slice(0, 5) };
    }
  }

  return { win: false, winLine: [] };
};

const getBestMove = (board) => {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] === null) {
        return { row, col };
      }
    }
  }
  return null;
};

/**
 * Determines if a game session should be stored as a replay based on policy
 */
const shouldStoreReplay = (gameType, difficulty) => {
  if (gameType === 'ONLINE' || gameType === 'LOCAL') return true;
  if (gameType === 'SINGLE' && difficulty === 'HARD') return true;
  return false;
};

    // Defensive Coding: Input Sanitization
    const boardSizeRaw = parseInt(gameData.boardSize) || 10;
    const size = Math.max(3, Math.min(boardSizeRaw, 20)); // Limit 3 to 20

    const difficultyRaw = (gameData.difficulty || 'MEDIUM').toUpperCase();
    const difficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficultyRaw) ? difficultyRaw : 'MEDIUM';

    const player1Marker = gameData.player1Marker || 'CROSS';
    const player2Marker = gameData.player2Marker || 'CIRCLE';
    const moveFirst = (gameData.moveFirst || 'player').toLowerCase();

    const initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    const initialMoves = [];
    let currentTurn = 'PLAYER1';

    // Handle "Bot moves first" logic (Atomic Initialization)
    if (moveFirst === 'bot') {
      const bestMove = getBestMove(initialBoard, difficulty, player2Marker, player1Marker);
      initialBoard[bestMove.row][bestMove.col] = player2Marker;

      initialMoves.push({
        step: 1,
        pId: null, // AI move
        x: bestMove.col,
        y: bestMove.row,
        marker: player2Marker,
        time: new Date()
      });

      currentTurn = 'PLAYER1';
    }

    const newSession = await gameRepository.createSession({
      gameType: gameData.gameType || 'SINGLE',
      boardSize: size,
      difficulty: difficulty,
      player1Id: userId,
      player1Name: p1.username,
      player1Avatar: p1.avatarUrl || '',
      player1Marker: player1Marker,
      player2Id: null,
      player2Name: 'AI',
      player2Avatar: '',
      player2Marker: player2Marker,
      boardState: initialBoard,
      moves: initialMoves,
      currentTurn: currentTurn,
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
    const board = [...session.boardState.map(row => [...row])];
    board[y][x] = playerMarker;

    // Explicitly update session object for Mongoose tracking (if not using lean)
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
        marker: aiMarker,
        time: new Date()
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
