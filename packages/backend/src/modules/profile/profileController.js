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
		const validatedData = ProfileDTO.transformUpdateReq(req.body);
		const { user, profile, stats } = await ProfileService.updateProfile(userId, validatedData);
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
            const queryParams = ProfileDTO.transformMatchHistoryQuery(userId, req.query);
            const historyPayload = await ProfileService.getMatchHistory(queryParams);
            const responseData = ProfileDTO.formatMatchHistoryResponse(historyPayload);

            return sendSuccess(res, 200, responseData, 'Match history fetched successfully.');
        } catch (error) {
            return sendError(res, 400, 'FETCH_HISTORY_FAILED', error.message);
        }
    }

    async uploadAvatar(req, res) {
        try {
            if (!req.file) {
                return sendError(res, 400, 'NO_FILE_UPLOADED', 'Please upload a file');
            }

            const userId = req.user.id;
            // The path will be something like 'public/uploads/avatars/avatar-xxx.png'
            // We want to serve it as 'http://localhost:5001/public/uploads/avatars/avatar-xxx.png'
            const avatarUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;

            const { user, profile, stats } = await ProfileService.updateProfile(userId, { avatarUrl });
            const responseData = ProfileDTO.formatResponse(user, profile, stats);

            return sendSuccess(res, 200, responseData, 'Avatar uploaded successfully');
        } catch (error) {
            console.error('Upload Avatar Error:', error);
            return sendError(res, 400, 'UPLOAD_AVATAR_FAILED', error.message);
        }
    }
}

export default new ProfileController();
