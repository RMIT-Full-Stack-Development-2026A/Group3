import { Profile, UserStatistic } from './profileModel.js';
import { GameSession } from '../game/gameModel.js';

class ProfileRepository {
  async findByUserId(userId) {
    return await Profile.findOne({ userId }).lean();
  }

  async updateByUserId(userId, updateData) {
    return await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  async getStatsByUserId(userId) {
    return await UserStatistic.findOne({ userId }).lean();
  }

  async createProfile(profileData) {
    return await Profile.create(profileData);
  }

  async createStats(statsData) {
    return await UserStatistic.create(statsData);
  }

  async initUserProfile(userId, country) {
    return await Promise.all([
      Profile.create({ userId, country }),
      UserStatistic.create({ userId })
    ]);
  }
}

export default new ProfileRepository();
