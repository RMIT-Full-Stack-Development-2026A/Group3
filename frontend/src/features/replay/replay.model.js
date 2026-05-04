export const createEmptyBoard = (boardSize) => {
  return Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => null));
};

export const applyMovesToBoard = (boardSize, moves, moveCount) => {
  const board = createEmptyBoard(boardSize);
  const visibleMoves = moves.slice(0, moveCount);

  visibleMoves.forEach((move) => {
    if (board[move.y] && board[move.y][move.x] !== undefined) {
      board[move.y][move.x] = move.marker;
    }
  });

  return board;
};
