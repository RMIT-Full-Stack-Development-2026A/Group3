import { checkWin, isValidMove } from '@tictactoang/shared/utils/gameLogicUtil.js';

/**
 * Local Game Logic Engine
 * Processes a move and returns the updated session state.
 */
export const processLocalMove = (session, localMoves, row, col) => {
  // 1. Validation
  if (!session || session.status !== 'ACTIVE') return null;
  if (!isValidMove(session.board, row, col)) return null;

  const currentTurn = session.currentTurn;
  const isP1 = currentTurn === 'PLAYER1';
  const player = isP1 ? session.p1 : session.p2;
  const marker = player.marker;

  // 2. Update Board
  const newBoard = session.board.map((r, ri) => 
    ri === row ? r.map((c, ci) => ci === col ? marker : c) : r
  );
  
  // 3. Record Move
  const newMove = {
    x: col,
    y: row,
    marker: marker,
    pId: player.id,
    time: new Date()
  };
  
  const updatedMoves = [...localMoves, newMove];

  // 4. Check Outcome
  const winResult = checkWin(newBoard, row, col, marker);
  let newStatus = 'ACTIVE';
  let winnerId = null;
  let matchOutcome = 'ONGOING';

  if (winResult.win) {
    newStatus = 'COMPLETED';
    winnerId = player.id;
    matchOutcome = isP1 ? 'WIN' : 'LOSS';
  } else if (newBoard.every(r => r.every(c => c !== null))) {
    newStatus = 'DRAW';
    matchOutcome = 'DRAW';
  }

  // 5. Construct Updated Session
  const updatedSession = {
    ...session,
    board: newBoard,
    currentTurn: isP1 ? 'PLAYER2' : 'PLAYER1',
    status: newStatus,
    winnerId,
    matchOutcome,
    winLine: winResult.winLine || []
  };

  return {
    updatedSession,
    updatedMoves,
    justEnded: newStatus !== 'ACTIVE'
  };
};
