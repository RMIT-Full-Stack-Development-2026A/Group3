import { getBestMove, checkWin, isBoardFull } from '@tictactoang/shared';
import GameRepository from './gameRepository.js';

// /**
//  * Game Service - Handles game logic, AI turns, and Session persistence
//  */

// /**
//  * Determines if a game session should be stored as a replay based on policy
//  */
// const shouldStoreReplay = (gameType, difficulty) => {
//   if (gameType === 'ONLINE' || gameType === 'LOCAL') return true;
//   if (gameType === 'SINGLE' && difficulty === 'HARD') return true;
//   return false;
// };

// /**
//  * Initialize a new game session
//  */
// const initGame = async (gameData) => {
//   const { gameType, boardSize, p1Id, p1Name, difficulty } = gameData;
  
//   const board = Array(boardSize || 10).fill(null).map(() => Array(boardSize || 10).fill(null));
//   const shouldSave = shouldStoreReplay(gameType, difficulty);
class GameService {
  async startGame(userId, gameData) {
    // Check for existing active session
    const activeSession = await gameRepository.findActiveSessionByPlayer(userId);
    if (activeSession) {
      await gameRepository.completeGame(activeSession._id, {
        status: 'ABORTED',
        winnerId: null
      });
    }

    const p1 = await authService.getUserById(userId);

    const boardSizeRaw = parseInt(gameData.boardSize) || 10;
    const size = Math.max(3, Math.min(boardSizeRaw, 20));

  // let sessionId = 'SESSION-GUEST-' + Date.now();

  // if (shouldSave) {
  //   const session = await GameRepository.createSession({
  //     gameType,
  //     boardSize: boardSize || 10,
  //     player1Id: p1Id,
  //     player1Name: p1Name,
  //     player2Name: gameType === 'SINGLE' ? `Bot ${difficulty}` : 'Guest',
  //     boardState: board,
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
    sessionId = session._id;
  }

//   return { sessionId, board, isReplayable: shouldSave };
// };

/**
 * Process an AI move for a given game state
 * @returns {Object} { row, col, isWin, isDraw, winLine }
 */
// const processAIMove = async (board, difficulty, aiMarker, playerMarker) => {
//   const bestMove = getBestMove(board, difficulty, aiMarker, playerMarker);
//   if (!bestMove) throw new Error('AI could not find a valid move');

//   const { row, col } = bestMove;
//   const winResult = checkWin(board, row, col, aiMarker);
//   const isDraw = !winResult.win && isBoardFull(board);

//   return {
//     row,
//     col,
//     isWin: winResult.win,
//     winLine: winResult.winLine,
//     isDraw
//   };
// };

/**
 * Sync a completed local match result to the database
 */
// const saveMatchResult = async (matchData) => {
//   return await GameRepository.createSession(matchData);
// };

/**
 * Fetch authenticated user's match history with filters and pagination
 */
    async getMatchHistory (historyQuery) {
      return await GameRepository.getPaginatedHistory(historyQuery);
    };


  //   session.boardState = board;
  //   const playerWin = checkWin(board, y, x, playerMarker);
  //   if (playerWin.win) {
  //     await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: currentTurnLabel });
  //     const finalSession = await gameRepository.completeGame(sessionId, {
  //       status: 'COMPLETED',
  //       winnerId: userId,
  //       winLine: playerWin.winLine
  //     });
  //     return GameDTO.transformGameSession(finalSession, userId);
  //   }

  //   if (isBoardFull(board)) {
  //     await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: currentTurnLabel });
  //     const finalSession = await gameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
  //     return GameDTO.transformGameSession(finalSession, userId);
  //   }

  //   if (session.gameType === 'SINGLE') {
  //     const aiMarker = isP1 ? session.player2Marker : session.player1Marker;
  //     const bestMove = getBestMove(board, session.difficulty, aiMarker, playerMarker);

  //     board[bestMove.row][bestMove.col] = aiMarker;
  //     const aiMove = {
  //       step: session.moves.length + 2,
  //       pId: null,
  //       x: bestMove.col,
  //       y: bestMove.row,
  //       marker: aiMarker,
  //       time: new Date()
  //     };

  //     const aiWin = checkWin(board, bestMove.row, bestMove.col, aiMarker);

  //     const updatedSession = await gameRepository.recordMoves(sessionId, {
  //       moves: [playerMove, aiMove],
  //       nextBoard: board,
  //       nextTurn: 'PLAYER1'
  //     });

  //     if (aiWin.win) {
  //       const finalSession = await gameRepository.completeGame(sessionId, {
  //         status: 'COMPLETED',
  //         winnerId: null, // AI win
  //         winLine: aiWin.winLine
  //       });
  //       return GameDTO.transformGameSession(finalSession, userId);
  //     }

  //     if (isBoardFull(board)) {
  //       const finalSession = await gameRepository.completeGame(sessionId, { status: 'COMPLETED', winnerId: null, winLine: [] });
  //       return GameDTO.transformGameSession(finalSession, userId);
  //     }

  //     return GameDTO.transformGameSession(updatedSession, userId);
  //   }

  //   const nextTurn = isP1 ? 'PLAYER2' : 'PLAYER1';
  //   const updatedSession = await gameRepository.recordMove(sessionId, { move: playerMove, nextBoard: board, nextTurn: nextTurn });
  //   return GameDTO.transformGameSession(updatedSession, userId);
  // }

  // async getGameById(sessionId, userId) {
  //   const session = await gameRepository.findById(sessionId);
  //   if (!session) throw new Error('Game not found');

  //   const p1Id = session.player1Id?._id?.toString() || session.player1Id?.toString();
  //   const p2Id = session.player2Id?._id?.toString() || session.player2Id?.toString();
  //   const currentUserId = userId.toString();

  //   if (p1Id !== currentUserId && p2Id !== currentUserId) {
  //     throw new Error('You do not have permission to access this match');
  //   }

  //   return GameDTO.transformGameSession(session, userId);
  // }
}

export default new GameService();
