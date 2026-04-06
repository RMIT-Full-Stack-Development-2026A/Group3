/**
 * Game DTO - Data Transfer Object
 * Handles request validation and response filtering for the Game module
 */
const GameDTO = {
  /**
   * Request DTO: Validate and transform move input
   */
  toMoveRequest: (body) => {
    const { row, col, marker } = body;
    if (row === undefined || col === undefined || !marker) {
      throw new Error('Invalid move coordinates or marker');
    }
    return {
      row: parseInt(row),
      col: parseInt(col),
      marker: marker.toUpperCase()
    };
  },

  /**
   * Request DTO: Capture the full offline match result after it ends
   */
  toSyncLocalRequest: (body) => {
    const { gameType, boardSize, p1Id, p1Name, p2Name, winnerId, winLine, moves } = body;
    if (!moves || !Array.isArray(moves)) {
      throw new Error('Moves history must be a valid array');
    }
    return {
      gameType: gameType || 'LOCAL',
      boardSize: boardSize || 10,
      player1Id: p1Id,
      player1Name: p1Name || 'Player 1',
      player2Name: p2Name || 'Player 2',
      status: winnerId ? 'WIN' : 'DRAW',
      winnerId: winnerId || null,
      winLine: winLine || [],
      moves: moves.map((m, idx) => ({
        step: idx + 1,
        pId: m.pId || null,
        x: m.x,
        y: m.y,
        marker: m.marker,
        time: m.time || new Date()
      }))
    };
  },

  /**
   * Response DTO: Filter game session for the client
   */
  toGameResponse: (game) => {
    return {
      id: game._id,
      gameType: game.gameType,
      status: game.status,
      board: game.boardState,
      winnerId: game.winnerId,
      winLine: game.winLine || [],
      isReplayable: (game.gameType === 'ONLINE' || game.gameType === 'LOCAL' || (game.gameType === 'SINGLE' && game.difficulty === 'HARD'))
    };
  }
};

export default GameDTO;
