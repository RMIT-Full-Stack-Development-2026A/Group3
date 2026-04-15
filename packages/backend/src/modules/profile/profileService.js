import profileRepository from './profileRepository.js';
import authRepository from '../auth/authRepository.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

class ProfileService {
  /**
   * Lấy đầy đủ dữ liệu hồ sơ người dùng
   */
  async getProfileData(userId) {
    let [user, profile, stats] = await Promise.all([
      authRepository.findById(userId),
      profileRepository.findByUserId(userId),
      profileRepository.getStatsByUserId(userId)
    ]);

    if (!user) throw new Error('User not found');

    // Tự động tạo Hồ sơ nếu chưa có (Lazy Initialization cho người dùng cũ)
    if (!profile) {
      console.log(`Lazy initializing profile for user ${userId}`);
      profile = await profileRepository.createProfile({
        userId,
        country: 'Vietnam', // Giá trị mặc định
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
      });
    }

    // Tự động tạo Thống kê nếu chưa có
    if (!stats) {
      console.log(`Lazy initializing stats for user ${userId}`);
      stats = await profileRepository.createStats({
        userId
      });
    }

    return { user, profile, stats };
  }

  /**
   * Cập nhật thông tin hồ sơ
   */
  async updateProfile(userId, updateData) {
    const { username, country } = updateData;

    // Nếu cập nhật username, cần gọi authRepository
    if (username) {
      await authRepository.updateUserInfo(userId, { username });
    }

    // Cập nhật thông tin trong bảng profile
    if (country) {
      await profileRepository.updateByUserId(userId, { country });
    }

    return this.getProfileData(userId);
  }

  /**
   * Xử lý và lưu trữ ảnh đại diện
   */
  async processAndSaveAvatar(userId, file) {
    const uploadDir = 'uploads/avatars';
    const filename = `avatar-${userId}-${Date.now()}.jpg`;
    const outputPath = path.join(uploadDir, filename);

    try {
      // Sử dụng Sharp để resize và tối ưu ảnh
      await sharp(file.path)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      // Xóa file tạm
      await fs.unlink(file.path);

      // Cập nhật URL trong DB (URL tương đối để frontend tự map)
      const avatarUrl = `/uploads/avatars/${filename}`;
      await profileRepository.updateByUserId(userId, { avatarUrl });

      return avatarUrl;
    } catch (error) {
      // Đảm bảo xóa file tạm nếu có lỗi xảy ra
      if (file.path) await fs.unlink(file.path).catch(() => {});
      throw new Error('Failed to process avatar: ' + error.message);
    }
  }

  /**
   * Lấy lịch sử ván đấu
   */
  async getMatchHistory(userId) {
    return await profileRepository.getMatchHistoryByUserId(userId);
  }
}

export default new ProfileService();
