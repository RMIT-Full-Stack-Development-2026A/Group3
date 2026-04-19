const matchHistoryModel = {
  formatHistory: (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(match => ({
      id: match.id || match._id,
      date: match.createdAt || match.date,
      mode: match.gameMode,
      opponent: match.players?.[1]?.username || 'AI',
      result: match.status === 'COMPLETED' ? (match.winner ? (match.winner === match.players[0].username ? 'WIN' : 'LOSS') : 'DRAW') : 'ABANDONED',
      difficulty: match.difficulty
    }));
  }
};

export default matchHistoryModel;
