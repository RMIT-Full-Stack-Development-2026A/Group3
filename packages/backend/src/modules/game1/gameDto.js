class GameDTO {
  static transformGameSession(session, currentUserId) {
    if (!session) return null;

  /**
   * Request DTO: Capture the full offline match result after it ends
   */
  toSyncLocalRequest: (body) => {
    const { gameType, boardSize, p1Id, p1Name, p1Avatar, p2Name, p2Avatar, winnerId, winLine, moves } = body;
    if (!moves || !Array.isArray(moves)) {
      throw new Error('Moves history must be a valid array');
    }
    return {
      gameType: gameType || 'LOCAL',
      boardSize: boardSize || 10,
      player1Id: p1Id,
      player1Name: p1Name || 'Player 1',
      player1Avatar: p1Avatar || '',
      player2Name: p2Name || 'Player 2',
      player2Avatar: p2Avatar || '',
      currentTurn: 'PLAYER1',
      status: 'ABORTED',
      winnerId: winnerId || null,
      winLine: winLine || [],
      endTime: new Date(),
      moves: moves.map((m, idx) => ({
        step: idx + 1,
        pId: m.pId || null,
        x: m.x,
        y: m.y,
        marker: m.marker,
        time: m.time || new Date()
      }))
    };
  }
}

  

  static transformHistoryList(sessions, currentUserId) {
    if (!sessions) return [];
    const userIdStr = currentUserId?.toString();

    return sessions.map(session => ({
      sessionId: session._id.toString(),
      gameType: session.gameType,
      opponentName: session.player1Id?.toString() === userIdStr 
        ? session.player2Name 
        : session.player1Name,
      status: session.status,
      outcome: this._calculateOutcome(session, userIdStr),
      createdAt: session.createdAt
    }));
  }

  static _calculateOutcome(session, userId) {
    if (session.status === 'ACTIVE') return 'ONGOING';
    if (session.status === 'ABORTED') return 'CANCELLED';
    
    if (!session.winnerId) {
      if (session.winLine && session.winLine.length > 0) return 'LOSS';
      return 'DRAW';
    }
    
    return session.winnerId.toString() === userId?.toString() ? 'WIN' : 'LOSS';
  }
}

export default GameDTO;
