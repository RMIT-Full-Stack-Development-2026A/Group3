import GameRepository from './gameRepository.js';
import AuthService from '../auth/authService.js';
import { getBestMove } from '@tictactoang/shared/utils/aiLogicUtil.js';
import { checkWin, isValidMove, isBoardFull } from '@tictactoang/shared/utils/gameLogicUtil.js';

class GameService {
  async startGame(userId, gameData) {
    const activeSession = await GameRepository.findActiveSessionByPlayer(userId);
    if (activeSession) {
      await GameRepository.completeGame(activeSession._id, {
        status: 'ABORTED',
        winnerId: null
      });
    }

    const p1 = await AuthService.getUserById(userId);

    const boardSizeRaw = parseInt(gameData.boardSize) || 10;
    const size = Math.max(3, Math.min(boardSizeRaw, 20));

    const difficultyRaw = (gameData.difficulty || 'MEDIUM').toUpperCase();
    const difficulty = ['EASY', 'MEDIUM', 'HARD'].includes(difficultyRaw) ? difficultyRaw : 'MEDIUM';

    const player1Marker = gameData.player1Marker || 'CROSS';
    const player2Marker = gameData.player2Marker || 'CIRCLE';
    const moveFirst = (gameData.moveFirst || 'player').toLowerCase();

    const initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    const initialMoves = [];
    let currentTurn = 'PLAYER1';

    // AI moves first
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

    const newSession = await GameRepository.createSession({
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

    return newSession;
  }

  async makeMove(sessionId, userId, { x, y }) {
    const session = await GameRepository.findById(sessionId);
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
      return finalSession;
    }

    if (isBoardFull(board)) {
      await GameRepository.recordMoves(sessionId, { moves: [playerMove], nextBoard: board, nextTurn: currentTurnLabel });
      const finalSession = await GameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
      return finalSession;
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

      const updatedSession = await GameRepository.recordMoves(sessionId, {
        moves: [playerMove, aiMove],
        nextBoard: board,
        nextTurn: 'PLAYER1'
      });

      if (aiWin.win) {
        const finalSession = await GameRepository.completeGame(sessionId, {
          status: 'COMPLETED',
          winnerId: null, // AI win
          winLine: aiWin.winLine
        });
        return finalSession;
      }

      if (isBoardFull(board)) {
        const finalSession = await GameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
        return finalSession;
      }

      return updatedSession;
    }

    const nextTurn = isP1 ? 'PLAYER2' : 'PLAYER1';
    const updatedSession = await GameRepository.recordMoves(sessionId, { moves: [playerMove], nextBoard: board, nextTurn: nextTurn });
    return updatedSession;
  }

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
}

export default new GameService();