import profileService from './profileService.js';
import { ProfileDTO } from './profileDto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;

class ProfileController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const { user, profile, stats } = await profileService.getProfileData(userId);
      const responseData = ProfileDTO.formatResponse(user, profile, stats);
      return sendSuccess(res, 200, responseData, 'Fetch profile successful');
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      return sendError(res, 400, 'FETCH_PROFILE_FAILED', error.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const validatedData = ProfileDTO.transformUpdateReq(req.body);
      const { user, profile, stats } = await profileService.updateProfile(userId, validatedData);
      const responseData = ProfileDTO.formatResponse(user, profile, stats);

      return sendSuccess(res, 200, responseData, 'Update profile successful');
    } catch (error) {
      console.error('Update Profile Error:', error);
      return sendError(res, 400, 'UPDATE_PROFILE_FAILED', error.message);
    }
  }

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
