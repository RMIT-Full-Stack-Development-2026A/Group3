const getAIName = (difficulty) => ({
  EASY: 'Havoc',
  MEDIUM: 'Berserker',
  HARD: 'Mayhem'
});

const replayModel = {
  formatReplay: (data) => {
    if (!data) return null;
    const difficulty = data.difficulty || null;

    return {
      id: data.id || data._id,
      gameType: data.gameType,
      difficulty,
      boardSize: data.boardSize || 10,
      boardTheme: data.boardTheme,
      status: data.status,
      winnerId: data.winnerId || null,
      winLine: Array.isArray(data.winLine) ? data.winLine : [],
      players: {
        player1Id: data.players?.player1Id || data.player1Id || null,
        player1Name: data.players?.player1Name || data.player1Name || 'Player 1',
        player2Id: data.players?.player2Id || data.player2Id || null,
        player2Name: data.gameType === 'SINGLE'
          ? (difficulty ? getAIName(difficulty) : data.players?.player2Name || data.player2Name || 'AI')
          : data.players?.player2Name || data.player2Name || 'Player 2'
      },
      moves: Array.isArray(data.moves) ? data.moves : []
    };
  },

  getPlayerMarkers: (replay) => {
    if (!replay) return { p1: 'CROSS', p2: 'CIRCLE' };

    const p1Id = replay.players?.player1Id;
    const p1Move = replay.moves.find((move) => move.playerId && String(move.playerId) === String(p1Id));
    const p2Move = replay.moves.find((move) => {
      if (!p1Id) return true;
      return String(move.playerId) !== String(p1Id);
    });

    return {
      p1: p1Move?.marker || 'CROSS',
      p2: p2Move?.marker || 'CIRCLE'
    };
  }
};

export default replayModel;
