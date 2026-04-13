class GameDTO {
  static transformGameSession(session, currentUserId) {
    if (!session) return null;

    const serializeId = (val) => val?._id?.toString() || val?.toString() || null;

    return {
      sessionId: session._id.toString(),
      gameType: session.gameType,
      boardSize: session.boardSize,
      difficulty: session.difficulty,
      status: session.status,
      
      players: {
        p1: {
          id: serializeId(session.player1Id),
          name: session.player1Name,
          avatar: session.player1Avatar,
          marker: session.player1Marker,
        },
        p2: {
          id: serializeId(session.player2Id),
          name: session.player2Name,
          avatar: session.player2Avatar,
          marker: session.player2Marker,
        }
      },

      gameState: {
        board: session.boardState,
        currentTurn: session.currentTurn,
        totalMoves: session.moves?.length || 0,
        lastMove: session.moves?.length > 0 ? session.moves[session.moves.length - 1] : null
      },

      result: {
        winnerId: serializeId(session.winnerId),
        winLine: session.winLine || [],
        matchOutcome: this._calculateOutcome(session, currentUserId),
        endTime: session.endTime
      }
    };
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
