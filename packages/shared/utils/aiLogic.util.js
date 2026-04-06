import { checkWin, isValidMove, countInDirection } from './gameLogic.util.js';

/**
 * Heuristic AI Engine
 * Using Hybrid Radial Scoring (Simulation + Pattern Matching)
 */

// Heuristic Score Table (Patterns & Weights)
const SCORES = {
  WIN: 1000000,           // 5 in a row (Immediate win)
  THREAT_4_OPEN: 100000,  // _XXXX_ (Open 4 - Unstoppable)
  THREAT_4_BLOCKED: 10000,// OXXXX_ or _XXXXO (Blocked 4)
  THREAT_3_OPEN: 5000,    // _XXX_ (Open 3 - Very dangerous)
  THREAT_3_BLOCKED: 500,  // OXXX_ or _XXXO
  THREAT_2_OPEN: 100      // _XX_
};

/**
 * Evaluate a single position on the board for a player
 */
export const evaluatePosition = (board, row, col, marker) => {
  if (!isValidMove(board, row, col)) return -1;

  let totalScore = 0;
  const directions = [
    { dr: 0, dc: 1 },  // Horizontal
    { dr: 1, dc: 0 },  // Vertical
    { dr: 1, dc: 1 },  // Main Diagonal
    { dr: 1, dc: -1 }  // Anti-Diagonal
  ];

  for (const { dr, dc } of directions) {
    const { count, openEnds } = countInDirection(board, row, col, dr, dc, marker);

    if (count >= 5) totalScore += SCORES.WIN;
    else if (count === 4) {
      if (openEnds === 2) totalScore += SCORES.THREAT_4_OPEN;
      else if (openEnds === 1) totalScore += SCORES.THREAT_4_BLOCKED;
    } else if (count === 3) {
      if (openEnds === 2) totalScore += SCORES.THREAT_3_OPEN;
      else if (openEnds === 1) totalScore += SCORES.THREAT_3_BLOCKED;
    } else if (count === 2) {
      if (openEnds === 2) totalScore += SCORES.THREAT_2_OPEN;
    }
  }

  return totalScore;
};

/**
 * Get the best move based on difficulty
 */
export const getBestMove = (board, difficulty, aiMarker, playerMarker) => {
  const size = board.length;
  let bestScore = -Infinity;
  let bestMove = null;
  const candidates = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        let hasNeighbor = false;
        for (let dr = -2; dr <= 2 && !hasNeighbor; dr++) {
          for (let dc = -2; dc <= 2 && !hasNeighbor; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] !== null) {
              hasNeighbor = true;
            }
          }
        }

        if (hasNeighbor || (r === Math.floor(size / 2) && c === Math.floor(size / 2))) {
          candidates.push({ r, c });
        }
      }
    }
  }

  if (candidates.length === 0) return { row: Math.floor(size / 2), col: Math.floor(size / 2) };

  if (difficulty === 'EASY') {
    const randomIdx = Math.floor(Math.random() * candidates.length);
    return { row: candidates[randomIdx].r, col: candidates[randomIdx].c };
  }

  for (const { r, c } of candidates) {
    if (checkWin(board, r, c, aiMarker).win) {
      return { row: r, col: c };
    }
  }

  for (const { r, c } of candidates) {
    const attackScore = evaluatePosition(board, r, c, aiMarker);
    const defenseScore = evaluatePosition(board, r, c, playerMarker);

    let score = 0;
    if (difficulty === 'MEDIUM') {
      score = attackScore + defenseScore * 1.5;
    } else {
      score = attackScore * 1.5 + defenseScore;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = { row: r, col: c };
    }
  }

  return bestMove;
};
