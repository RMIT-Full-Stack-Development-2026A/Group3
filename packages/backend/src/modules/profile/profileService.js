import profileRepository from './profileRepository.js';
import authRepository from '../auth/authRepository.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

class ProfileService {
  async getProfileData(userId) {
    let [user, profile, stats] = await Promise.all([
      authRepository.findById(userId),
      profileRepository.findByUserId(userId),
      profileRepository.getStatsByUserId(userId)
    ]);


    if (!user) throw new Error('User not found');


    if (!profile) {
      profile = await profileRepository.createProfile({
        userId,
        country: 'Vietnam',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
      });
    }


    if (!stats) {
      stats = await profileRepository.createStats({ userId });
    }


    return { user, profile, stats };
  }

  async updateProfile(userId, updateData) {
    const { username, country, avatarUrl } = updateData;


    if (username) {
    const existingUser = await authRepository.findByUsername(username);
      if (existingUser && existingUser._id.toString() !== userId) throw new Error('Username already taken');
      await authRepository.updateUserInfo(userId, { username });
    }


    const profileUpdates = {};
    if (country) profileUpdates.country = country;
    if (avatarUrl) profileUpdates.avatarUrl = avatarUrl;
    if (Object.keys(profileUpdates).length > 0) await profileRepository.updateByUserId(userId, profileUpdates);


    return this.getProfileData(userId);
  }
}

export default new ProfileService();
