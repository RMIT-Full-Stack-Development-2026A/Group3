import GameRepository from './gameRepository.js';

/**
 * Game Service - Handles game logic, AI turns, and Session persistence
 */

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

/**
 * Initialize a new game session
 */
const initGame = async (gameData) => {
  const { gameType, boardSize, p1Id, p1Name, difficulty } = gameData;
  
  const board = Array(boardSize || 10).fill(null).map(() => Array(boardSize || 10).fill(null));
  const shouldSave = shouldStoreReplay(gameType, difficulty);

  let sessionId = 'SESSION-GUEST-' + Date.now();

  if (shouldSave) {
    const session = await GameRepository.createSession({
      gameType,
      boardSize: boardSize || 10,
      player1Id: p1Id,
      player1Name: p1Name,
      player2Name: gameType === 'SINGLE' ? `Bot ${difficulty}` : 'Guest',
      currentTurn: 'PLAYER1',
      boardState: board,
      status: 'ACTIVE'
    });
    sessionId = session._id;
  }

  return { sessionId, board, isReplayable: shouldSave };
};

/**
 * Process an AI move for a given game state
 * @returns {Object} { row, col, isWin, isDraw, winLine }
 */
const processAIMove = async (board, difficulty, aiMarker, playerMarker) => {
  const bestMove = getBestMove(board, difficulty, aiMarker, playerMarker);
  if (!bestMove) throw new Error('AI could not find a valid move');

  const { row, col } = bestMove;
  const winResult = checkWin(board, row, col, aiMarker);
  const isDraw = !winResult.win && isBoardFull(board);

  return {
    row,
    col,
    isWin: winResult.win,
    winLine: winResult.winLine,
    isDraw
  };
};

/**
 * Sync a completed local match result to the database
 */
const saveMatchResult = async (matchData) => {
  return await GameRepository.createSession(matchData);
};

export default {
  initGame,
  processAIMove,
  saveMatchResult,
  shouldStoreReplay
};

