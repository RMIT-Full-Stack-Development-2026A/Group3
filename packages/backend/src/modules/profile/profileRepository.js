import { Profile, UserStatistic } from './profileModel.js';

class ProfileRepository {
  async findProfileByUserId(userId) {
    return await Profile.findOne({ userId }).lean();
  }
  async findStatsByUserId(userId) {
    return await UserStatistic.findOne({ userId }).lean();
  }

  async updateProfileByUserId(userId, updateData) {
    return await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).lean();
  }

  async updateStatsByUserId(userId, updateData) {
    return await UserStatistic.findOneAndUpdate(
      { userId },
      { $inc: updateData },
      { new: true, runValidators: true, upsert: true }
    ).lean();
  }

  async createProfile(profileData) {
    return await Profile.create(profileData);
  }

  async createStats(statsData) {
    return await UserStatistic.create(statsData);
  }

  async initUserProfile(userId, country, avatarUrl) {
    return await Promise.all([
      Profile.create({ userId, country, avatarUrl }),
      UserStatistic.create({ userId })
    ]);
  }
}

export default new ProfileRepository();