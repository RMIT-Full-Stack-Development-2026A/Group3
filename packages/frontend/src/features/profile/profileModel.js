import { API_CONFIG } from '../../configs/apiConfig';

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
        displayAvatarUrl: profileModel.getAvatarUrl(profile?.avatarUrl, 400),
        iconAvatarUrl: profileModel.getAvatarUrl(profile?.avatarUrl, 100)
      },
      stats: {
        ...statistics,
        level: Math.floor((statistics?.totalGames || 0) / 10) + 1,
        winRateNumber: parseFloat(statistics?.winRate) || 0
      }
    };
  },
  getAvatarUrl: (url, size = 200) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=Kaelen`;
    
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,g_face,q_auto,f_auto/`);
    }
    
    if (url.startsWith('http')) return url;
    
    const serverBase = API_CONFIG.BASE_URL.replace('/api/v1', '');
    return `${serverBase}${url}`;
  }
};

export default profileModel;
