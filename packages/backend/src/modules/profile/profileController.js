import ProfileService from './profileService.js';
import { ProfileDTO } from './profileDto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;

class ProfileController {
	async getProfile(req, res) {
		try {
		const userId = req.user.id;
		const { user, profile, stats } = await ProfileService.getProfileData(userId);
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
		const validatedData = ProfileDTO.toUpdateReq(req.body);
		const { user, profile, stats } = await ProfileService.updateProfile(userId, validatedData);
		const responseData = ProfileDTO.formatResponse(user, profile, stats);

		return sendSuccess(res, 200, responseData, 'Update profile successful');
		} catch (error) {
		console.error('Update Profile Error:', error);
		return sendError(res, 400, 'UPDATE_PROFILE_FAILED', error.message);
		}
	}
}

export default new ProfileController();
