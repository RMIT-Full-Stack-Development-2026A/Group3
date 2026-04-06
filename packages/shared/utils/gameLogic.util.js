/**
 * Game Logic Utilities (Shared between Offline Mode and AI Mode)
 */

/**
 * Core radial scanning logic - Counts consecutive markers in a given direction
 * @returns {object} { count, openEnds }
 */
export const countInDirection = (board, row, col, dr, dc, marker) => {
  const boardSize = board.length;
  let count = 1;
  let openEnds = 0;
  let winLine = [[row, col]];

  // Scan positive direction
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === marker) {
    count++;
    winLine.push([r, c]);
    r += dr;
    c += dc;
  }
  if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === null) {
    openEnds++;
  }

  // Scan negative direction
  r = row - dr;
  c = col - dc;
  while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === marker) {
    count++;
    winLine.push([r, c]);
    r -= dr;
    c -= dc;
  }
  if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === null) {
    openEnds++;
  }

  return { count, openEnds, winLine };
};

/**
 * Check if the current move results in a win using Radial Local Search O(1)
 */
export const checkWin = (board, row, col, marker) => {
  const directions = [
    { dr: 0, dc: 1 },  // Horizontal
    { dr: 1, dc: 0 },  // Vertical
    { dr: 1, dc: 1 },  // Main Diagonal
    { dr: 1, dc: -1 }  // Anti-Diagonal
  ];

  for (const { dr, dc } of directions) {
    const { count, winLine } = countInDirection(board, row, col, dr, dc, marker);
    if (count >= 5) {
      return { win: true, winLine };
    }
  }

  return { win: false, winLine: [] };
};

/**
 * Check if a move is valid (within bounds and cell is empty)
 */
export const isValidMove = (board, row, col) => {
  const size = board.length;
  return row >= 0 && row < size && col >= 0 && col < size && board[row][col] === null;
};

/**
 * Check if the board is full (Draw)
 */
export const isBoardFull = (board) => {
  return board.every((row) => row.every((cell) => cell !== null));
};
