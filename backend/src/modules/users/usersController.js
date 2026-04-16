import { responseHelper } from '../../common/responseHelper.js';
import { usersService } from './usersService.js';

const { sendSuccess, sendError } = responseHelper;

export const usersController = {
	getMe: async (req, res) => {
		try {
			const user = await usersService.getPublicById(req.user.id);
			if (!user) {
				return sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
			}
			return sendSuccess(res, 200, user, 'User profile fetched');
		} catch (error) {
			return sendError(res, 500, 'USERS_FETCH_FAILED', error.message || 'Failed to fetch user');
		}
	}
};
