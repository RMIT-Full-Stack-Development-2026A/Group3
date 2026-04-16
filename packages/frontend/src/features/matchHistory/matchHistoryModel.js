const normalizeResult = (value) => {
  const raw = String(value || 'LOSS').toUpperCase();
  if (raw === 'WIN' || raw === 'LOSS' || raw === 'DRAW') {
    return raw;
  }
  return 'LOSS';
};

export const toMatchHistoryRow = (item = {}) => {
  const matchId = String(item.matchId || item.id || '');
  const fallbackId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: matchId || fallbackId,
    matchId,
    gameType: String(item.gameType || 'LOCAL').toUpperCase(),
    boardSize: Number(item.boardSize) || 10,
    status: String(item.status || '').toUpperCase(),
    opponentName: item.opponentName || 'Unknown',
    result: normalizeResult(item.result),
    playedAt: item.playedAt || null
  };
};
