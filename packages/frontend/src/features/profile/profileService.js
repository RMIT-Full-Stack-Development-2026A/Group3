import httpUtil from '../../utils/httpUtil';

/**
 * ProfileService - Quản lý giao tiếp API cho module Hồ sơ
 */
const ProfileService = {
  /**
   * Lấy dữ liệu hồ sơ từ server
   */
  getProfile: async () => {
    try {
      const response = await httpUtil.get('/profile');
      console.log('Profile API Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin hồ sơ (username, country)
   */
  updateProfile: async (data) => {
    try {
      const response = await httpUtil.put('/profile', data);
      return response;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Tải lên ảnh đại diện mới
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Không set Content-Type thủ công để Axios tự động xử lý boundary
      const response = await httpUtil.post('/profile/avatar', formData);
      console.log('Avatar Upload Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử trận đấu của người dùng
   */
  getMatchHistory: async () => {
    try {
      const response = await httpUtil.get('/profile/history');
      return response;
    } catch (error) {
      console.error('Failed to fetch match history:', error);
      throw error;
    }
  }
};

export default ProfileService;
