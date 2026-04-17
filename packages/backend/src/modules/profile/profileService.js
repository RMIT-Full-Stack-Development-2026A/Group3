import profileRepository from './profileRepository.js';
import authRepository from '../auth/authRepository.js';
import gameService from '../game/gameService.js';

class ProfileService {
  async getProfileData(userId) {
    let [user, profile, stats] = await Promise.all([
      authRepository.findById(userId),
      profileRepository.findProfileByUserId(userId),
      profileRepository.findStatsByUserId(userId)
    ]);


    if (!user) throw new Error('User not found');
    
    if (!profile || !stats) {
      [profile, stats] = await profileRepository.initUserProfile(
        userId, 
        'Vietnam', 
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
      );
    }

    return { user, profile, stats };
  }

  async updateProfile(userId, updateData) {
    const { username, country, avatarUrl } = updateData;

    // 1. Update Auth info if username changed
    if (username) {
      const existingUser = await authRepository.findByUsername(username);
      if (existingUser && existingUser._id.toString() !== userId.toString()) throw new Error('Username already taken');
      await authRepository.updateUserInfo(userId, { username });
    }

    // 2. Update Profile info if any
    const profileUpdates = {};
    if (country) profileUpdates.country = country;
    if (avatarUrl) profileUpdates.avatarUrl = avatarUrl;
    if (Object.keys(profileUpdates).length > 0) await profileRepository.updateProfileByUserId(userId, profileUpdates);

    return this.getProfileData(userId);
  }

  async getMatchHistory (queryParams) {
      return await gameService.getMatchHistory(queryParams);
  }
}

export default new ProfileService();