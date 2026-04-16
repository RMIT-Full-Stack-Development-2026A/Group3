const ProfileModel = {
  formatProfileData: (data) => {
    if (!data) return null;

    const { user, profile, statistics } = data;

    return {
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joinedAt: user.joinedAt || user.createdAt
      },
      profile: {
        country: profile.country || 'Global Player',
        avatarUrl: profile.avatarUrl || '',
        isPremium: profile.isPremium || false,
        walletBalance: profile.walletBalance || 0,
        premiumExpiry: profile.premiumExpiry
      },
      stats: {
        totalGames: statistics.totalGames || 0,
        wins: statistics.wins || 0,
        losses: statistics.losses || 0,
        draws: statistics.draws || 0,
        eloRating: statistics.eloRating || 1000,
        winRate: statistics.winRate || '0%',
        level: Math.floor((statistics.totalGames || 0) / 10) + 1
      }
    };
  }
};

export default ProfileModel;
