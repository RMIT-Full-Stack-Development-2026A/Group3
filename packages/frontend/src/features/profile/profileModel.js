import { getAvatarUrl } from '../../shared/utils/avatarUtil';

const profileModel = {
  formatProfile: (data) => {
    if (!data) return null;
    const { user, profile, statistics } = data;

    return {
      user: {
        ...user,
        joinedAt: user?.createdAt
      },
      profile: {
        ...profile,
        country: profile?.country,
        displayAvatarUrl: getAvatarUrl(profile?.avatarUrl, 400),
        iconAvatarUrl: getAvatarUrl(profile?.avatarUrl, 100)
      },
      stats: {
        ...statistics,
        level: Math.floor((statistics?.totalGames || 0) / 10) + 1,
        winRateNumber: parseFloat(statistics?.winRate) || 0
      }
    };
  }
};

export default profileModel;
