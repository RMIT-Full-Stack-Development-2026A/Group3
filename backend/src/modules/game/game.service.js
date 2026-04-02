const { getBestMove } = require('./helpers/aiLogic.helper');
const { checkWin, isValidMove, isBoardFull } = require('./helpers/gameLogic.helper');

/**
 * Game Service - Handles game logic and AI turns
 */

/**
 * Process an AI move for a given game state
 * @param {Array<Array<string>>} board - Current 15x15 board
 * @param {string} difficulty - 'EASY' | 'MEDIUM' | 'HARD'
 * @param {string} aiMarker - 'X' or 'O'
 * @param {string} playerMarker - 'X' or 'O'
 * @returns {Object} { row, col, isWin, isDraw }
 */
const processAIMove = async (board, difficulty, aiMarker, playerMarker) => {
  // 1. Get the best move from the AI Engine
  const bestMove = getBestMove(board, difficulty, aiMarker, playerMarker);

  if (!bestMove) {
    throw new Error('AI could not find a valid move');
  }

  const { row, col } = bestMove;

  // 2. Simulate placing the stone to check for win
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

module.exports = {
  processAIMove
};
