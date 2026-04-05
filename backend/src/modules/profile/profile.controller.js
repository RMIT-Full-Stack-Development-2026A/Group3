const responseHelper = require('../../common/responseHelper');

const { toMatchHistoryQuery } = require('./profile.dto');
const { profileService } = require('./profile.service');

const createUnauthorizedError = (message) => {
	const error = new Error(message);
	error.statusCode = 401;
	error.errorCode = 'UNAUTHORIZED';
	return error;
};

const resolveCurrentUserId = (req) => {
	if (req.user?.id) {
		return String(req.user.id);
	}

	if (typeof req.headers['x-user-id'] === 'string' && req.headers['x-user-id'].trim()) {
		return req.headers['x-user-id'].trim();
	}

	throw createUnauthorizedError('Authenticated user context is required.');
};

const createProfileController = (service = profileService) => {
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
};

const profileController = createProfileController();

module.exports = {
	createProfileController,
	profileController
};
