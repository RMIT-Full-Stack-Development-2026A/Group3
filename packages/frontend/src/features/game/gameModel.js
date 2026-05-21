const gameModel = {
  formatSession: (data) => {
    if (!data) return null;
    
    const gameState = data.gameState;
    const players = data.players;
    const result = data.result;

    return {
      id: data.sessionId,
      roomId: data.roomId,
      roomCode: data.roomCode,
      board: gameState.board,
      currentTurn: gameState.currentTurn,
      status: data.status,
      boardSize: data.boardSize,
      boardTheme: data.boardTheme,
      
      p1: players.p1,
      p2: players.p2,
      
      winnerId: result.winnerId,
      winLine: result.winLine,
      matchOutcome: result.matchOutcome,
      gameType: data.gameType,
      
      lastMove: gameState.lastMove
    };
  }
};

export default gameModel;
