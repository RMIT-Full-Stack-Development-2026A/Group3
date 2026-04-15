import { Profile, UserStatistic } from './profileModel.js';
import { GameSession } from '../game/gameModel.js';

class ProfileRepository {
  /**
   * Tìm hồ sơ người dùng theo userId
   */
  async findByUserId(userId) {
    return await Profile.findOne({ userId }).lean();
  }

  /**
   * Cập nhật hồ sơ người dùng
   */
  async updateByUserId(userId, updateData) {
    return await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Lấy thống kê của người dùng
   */
  async getStatsByUserId(userId) {
    return await UserStatistic.findOne({ userId }).lean();
  }

  /**
   * Lấy lịch sử đấu gần nhất (10 ván)
   */
  async getMatchHistoryByUserId(userId, limit = 10) {
    return await GameSession.find({
      $or: [
        { player1Id: userId },
        { player2Id: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  }

  /**
   * Tạo hồ sơ mới
   */
  async createProfile(profileData) {
    return await Profile.create(profileData);
  }

  /**
   * Tạo thống kê mới
   */
  async createStats(statsData) {
    return await UserStatistic.create(statsData);
  }
}

export default new ProfileRepository();
