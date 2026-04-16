import { responseHelper } from '../../common/responseHelper.js';
import { profileService } from './profileService.js';

const { sendSuccess, sendError } = responseHelper;

export const profileController = {
	getMyProfile: async (req, res) => {
		try {
			const data = await profileService.getProfileOverview(req.user.id);
			if (!data) {
				return sendError(res, 404, 'PROFILE_NOT_FOUND', 'Profile not found');
			}
			return sendSuccess(res, 200, data, 'Profile fetched');
		} catch (error) {
			return sendError(res, 500, 'PROFILE_FETCH_FAILED', error.message || 'Failed to fetch profile');
		}
	}
};
