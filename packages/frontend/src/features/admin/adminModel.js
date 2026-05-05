import { getAvatarUrl } from '../../shared/utils/avatarUtil';

const adminModel = {
  formatUserRow: (userData) => {
    if (!userData) return null;
    
    // Fallbacks for data to ensure the UI doesn't crash on missing fields
    return {
      id: userData._id || userData.id,
      username: userData.username,
      email: userData.email,
      country: userData.country,
      avatarUrl: getAvatarUrl(userData.avatarUrl, 100),
      isPremium: userData.isPremium || false,
      isActive: userData.isActive !== false,
    };
  },
  
  formatUserList: (usersData) => {
    if (!Array.isArray(usersData)) return [];
    return usersData.map(adminModel.formatUserRow);
  }
};

export default adminModel;
