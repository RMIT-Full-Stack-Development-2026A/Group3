const gameModel = {
  formatSession: (data) => {
    if (!data) return null;
    
    // Support both old and new data structures during transition
    const gameState = data.gameState || {};
    const players = data.players || {};
    const result = data.result || {};

    return {
      id: data.sessionId || data.id || data._id,
      board: gameState.board || data.board || [],
      currentTurn: gameState.currentTurn || data.currentPlayer,
      status: data.status,
      boardSize: data.boardSize || 10,
      
      p1: players.p1 || (data.players ? data.players[0] : null),
      p2: players.p2 || (data.players ? data.players[1] : null),
      
      winnerId: result.winnerId || data.winner,
      winLine: result.winLine || [],
      matchOutcome: result.matchOutcome,
      
      lastMove: gameState.lastMove || data.lastMove
    };
  }
};

export default gameModel;
