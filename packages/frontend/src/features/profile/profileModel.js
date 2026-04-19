const profileModel = {
  formatProfile: (data) => {
    if (!data) return null;
    return {
      user: data.user,
      profile: {
        country: data.profile?.country || 'Global Player',
        avatarUrl: data.profile?.avatarUrl,
        isPremium: data.profile?.isPremium || false,
        walletBalance: data.profile?.walletBalance || 0
      },
      stats: {
        totalGames: data.statistics?.totalGames || 0,
        wins: data.statistics?.wins || 0,
        losses: data.statistics?.losses || 0,
        draws: data.statistics?.draws || 0,
        eloRating: data.statistics?.eloRating || 1000,
        winRate: data.statistics?.winRate || '0%',
        level: Math.floor((data.statistics?.totalGames || 0) / 10) + 1
      }
    };
  }
};

export default profileModel;
