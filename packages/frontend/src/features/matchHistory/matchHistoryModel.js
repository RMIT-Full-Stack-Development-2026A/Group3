const matchHistoryModel = {
  /**
   * Format history items from the backend DTO response.
   * Backend returns: { matchId, gameType, boardSize, status, opponentName, result, playedAt }
   */
  formatHistory: (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(match => ({
      id: match.matchId || match.id || match._id,
      date: match.playedAt || match.createdAt || match.date,
      gameType: match.gameType || 'SINGLE',
      boardSize: match.boardSize || 10,
      status: match.status || 'COMPLETED',
      opponent: match.opponentName || match.players?.[1]?.username || 'AI',
      result: match.result || 'DRAW',
      difficulty: match.difficulty
    }));
  },

  /**
   * Get display-friendly game type label.
   */
  getGameTypeLabel: (type) => {
    const labels = {
      'SINGLE': 'vs AI',
      'LOCAL': 'Local PvP',
      'ONLINE': 'Online'
    };
    return labels[type] || type;
  },

  /**
   * Get icon name for game type (Material Symbols).
   */
  getGameTypeIcon: (type) => {
    const icons = {
      'SINGLE': 'smart_toy',
      'LOCAL': 'group',
      'ONLINE': 'public'
    };
    return icons[type] || 'sports_esports';
  },

  /**
   * Get result color classes.
   */
  getResultTheme: (result) => {
    const themes = {
      'WIN': {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/10',
        icon: 'emoji_events',
        label: 'Victory'
      },
      'LOSS': {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        glow: 'shadow-rose-500/10',
        icon: 'close',
        label: 'Defeat'
      },
      'DRAW': {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/10',
        icon: 'handshake',
        label: 'Draw'
      },
      'CANCELLED': {
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-on-surface-variant',
        glow: '',
        icon: 'block',
        label: 'Cancelled'
      }
    };
    return themes[result] || themes['DRAW'];
  }
};

export default matchHistoryModel;
