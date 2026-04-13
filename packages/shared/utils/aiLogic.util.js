import { checkWin, isValidMove, countInDirection } from './gameLogic.util.js';

// Heuristic Score Table
const SCORES = {
  WIN: 1000000,           // 5 in a row (Immediate win)
  THREAT_4_OPEN: 100000,  // _XXXX_ (Open 4 - Unstoppable)
  THREAT_4_BLOCKED: 10000,// OXXXX_ or _XXXXO (Blocked 4)
  THREAT_3_OPEN: 5000,    // _XXX_ (Open 3 - Very dangerous)
  THREAT_3_BLOCKED: 500,  // OXXX_ or _XXXO
  THREAT_2_OPEN: 100      // _XX_
};

const calculateLineScore = (board, row, col, marker) => {
  let totalScore = 0;
  const directions = [ { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 } ];
  
  for (const { dr, dc } of directions) {
    const { count, openEnds } = countInDirection(board, row, col, dr, dc, marker);
    if (count >= 5) totalScore += SCORES.WIN;
    else if (count === 4) {
      if (openEnds === 2) totalScore += SCORES.THREAT_4_OPEN;
      else if (openEnds === 1) totalScore += SCORES.THREAT_4_BLOCKED;
    } else if (count === 3) {
      if (openEnds === 2) totalScore += SCORES.THREAT_3_OPEN;
      else if (openEnds === 1) totalScore += SCORES.THREAT_3_BLOCKED;
    } else if (count === 2 && openEnds === 2) {
      totalScore += SCORES.THREAT_2_OPEN;
    }
  }
  return totalScore;
};

export const evaluatePosition = (board, row, col, marker) => {
  if (!isValidMove(board, row, col)) return -1;
  return calculateLineScore(board, row, col, marker);
};

const evaluateStaticLines = (board, row, col, marker) => {
  return calculateLineScore(board, row, col, marker);
};

const getBoundingBox = (board) => {
  const size = board.length;
  let minR = size, maxR = -1, minC = size, maxC = -1;
  let hasMarker = false;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) { 
        hasMarker = true;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  if (!hasMarker) return null;
  
  return {
    minR: Math.max(0, minR - 2), maxR: Math.min(size - 1, maxR + 2),
    minC: Math.max(0, minC - 2), maxC: Math.min(size - 1, maxC + 2)
  };
};

const getTopCandidateMoves = (board, currentAttacker, currentDefender, box, limit) => {
  const size = board.length;

  if (!box) return [{ row: Math.floor(size / 2), col: Math.floor(size / 2), score: 0 }];

  const candidates = [];

  for (let r = box.minR; r <= box.maxR; r++) {
    for (let c = box.minC; c <= box.maxC; c++) {
      if (board[r][c] === null) {
        let hasNeighbor = false;

        for (let dr = -2; dr <= 2 && !hasNeighbor; dr++) {
          for (let dc = -2; dc <= 2 && !hasNeighbor; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              if (board[nr][nc] !== null) hasNeighbor = true;
            }
          }
        }

        if (hasNeighbor) {
          const attackScore = evaluatePosition(board, r, c, currentAttacker);
          const defenseScore = evaluatePosition(board, r, c, currentDefender);
          const totalScore = attackScore + (defenseScore * 2.0); 

          if (totalScore > 0) candidates.push({ row: r, col: c, score: totalScore });
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return limit ? candidates.slice(0, limit) : candidates;
};

const minimax = (board, depth, alpha, beta, isMaximizing, aiMarker, playerMarker, lastMove, rootBox) => {
  if (lastMove) {
    const lastPlayer = isMaximizing ? playerMarker : aiMarker;
    const winResult = checkWin(board, lastMove.row, lastMove.col, lastPlayer);
    if (winResult.win) {
      return isMaximizing ? -(SCORES.WIN + depth) : (SCORES.WIN + depth);
    }
  }

  if (depth === 0) {
    const lastPlayer = isMaximizing ? playerMarker : aiMarker;
    const staticScore = evaluateStaticLines(board, lastMove.row, lastMove.col, lastPlayer);
    return isMaximizing ? -staticScore : staticScore;
  }

  const currentAttacker = isMaximizing ? aiMarker : playerMarker;
  const currentDefender = isMaximizing ? playerMarker : aiMarker;

  const candidateMoves = getTopCandidateMoves(board, currentAttacker, currentDefender, rootBox, 10);
  if (candidateMoves.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of candidateMoves) {
      board[move.row][move.col] = aiMarker;
      const evalScore = minimax(board, depth - 1, alpha, beta, false, aiMarker, playerMarker, move, rootBox);
      board[move.row][move.col] = null;

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; 
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of candidateMoves) {
      board[move.row][move.col] = playerMarker;
      const evalScore = minimax(board, depth - 1, alpha, beta, true, aiMarker, playerMarker, move, rootBox);
      board[move.row][move.col] = null;

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; 
    }
    return minEval;
  }
};

export const getBestMove = (board, difficulty, aiMarker, playerMarker) => {
  const rootBox = getBoundingBox(board);
  const candidates = getTopCandidateMoves(board, aiMarker, playerMarker, rootBox, 15);

  if (candidates.length === 0) return { row: Math.floor(board.length / 2), col: Math.floor(board.length / 2) };

  for (const move of candidates) {
    board[move.row][move.col] = aiMarker;
    const isWin = checkWin(board, move.row, move.col, aiMarker).win;
    board[move.row][move.col] = null;
    if (isWin) return move;
  }
  
  for (const move of candidates) {
    board[move.row][move.col] = playerMarker;
    const isWin = checkWin(board, move.row, move.col, playerMarker).win;
    board[move.row][move.col] = null;
    if (isWin) return move;
  }

  switch (difficulty) {
    case 'EASY':
      return candidates[Math.floor(Math.random() * candidates.length)];

    case 'MEDIUM':
      return candidates[0];

    case 'HARD':
      let bestScore = -Infinity;
      let bestMove = candidates[0];
      let alpha = -Infinity;
      let beta = Infinity;
      const DEPTH = 4; 

      for (const move of candidates) {
        board[move.row][move.col] = aiMarker;
        const score = minimax(board, DEPTH - 1, alpha, beta, false, aiMarker, playerMarker, move, rootBox);
        board[move.row][move.col] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
      }
      return bestMove;

    default:
      return candidates[0];
  }
};