import profileService from './profileService.js';
import { updateProfileRequestDto, profileResponseDto } from './profileDto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;

class ProfileController {
  /**
   * Lấy thông tin hồ sơ của người dùng hiện tại
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const { user, profile, stats } = await profileService.getProfileData(userId);

      const responseData = profileResponseDto.build(user, profile, stats);
      return sendSuccess(res, 200, responseData, 'Fetch profile successful');
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      return sendError(res, 400, 'FETCH_PROFILE_FAILED', error.message);
    }
  }

  /**
   * Cập nhật thông tin hồ sơ (Tên người dùng, quốc gia)
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log('Update Profile Request:', { userId, body: req.body });
      // Validate dữ liệu đầu vào qua DTO
      const validatedData = updateProfileRequestDto.validate(req.body);

      const { user, profile, stats } = await profileService.updateProfile(userId, validatedData);
      const responseData = profileResponseDto.build(user, profile, stats);

      return sendSuccess(res, 200, responseData, 'Update profile successful');
    } catch (error) {
      console.error('Update Profile Error:', error);
      return sendError(res, 400, 'UPDATE_PROFILE_FAILED', error.message);
    }
  }

  /**
   * Tải lên và cập nhật ảnh đại diện
   */
  async uploadAvatar(req, res) {
    try {
      const userId = req.user.id;
      console.log('Upload Avatar Request:', { userId, file: req.file });
      if (!req.file) {
        return sendError(res, 400, 'FILE_MISSING', 'No avatar file provided');
      }

      const avatarUrl = await profileService.processAndSaveAvatar(userId, req.file);

      return sendSuccess(res, 200, { avatarUrl }, 'Avatar uploaded and resized successfully');
    } catch (error) {
      console.error('Upload Avatar Error:', error);
      return sendError(res, 500, 'UPLOAD_AVATAR_FAILED', error.message);
    }
  }

  /**
   * Lấy lịch sử ván đấu của người dùng
   */
  async getMatchHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await profileService.getMatchHistory(userId);

      return sendSuccess(res, 200, history, 'Fetch match history successful');
    } catch (error) {
      return sendError(res, 400, 'FETCH_HISTORY_FAILED', error.message);
    }
  }
}

export default new ProfileController();
