import profileService from './profileService.js';
import { ProfileDTO, toMatchHistoryQuery } from './profileDto.js';
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

  async createUnauthorizedError (message) {
	const error = new Error(message);
	error.statusCode = 401;
	error.errorCode = 'UNAUTHORIZED';
	return error;
};

async resolveCurrentUserId (req) {
	if (req.user?.id) {
		return String(req.user.id);
	}

	if (typeof req.headers['x-user-id'] === 'string' && req.headers['x-user-id'].trim()) {
		return req.headers['x-user-id'].trim();
	}

	throw createUnauthorizedError('Authenticated user context is required.');
}

async createProfileController (service = profileService) {
	return {
		getMatchHistory: async (req, res, next) => {
			try {
				const currentUserId = resolveCurrentUserId(req);
				const query = toMatchHistoryQuery(currentUserId, req.query);
				const payload = await service.getMatchHistory(query);

				return responseHelper.sendSuccess(
					res,
					200,
					payload,
					'Match history fetched successfully.'
				);
			} catch (error) {
				return next(error);
			}
		}
	};
}

}

export default new ProfileController();
