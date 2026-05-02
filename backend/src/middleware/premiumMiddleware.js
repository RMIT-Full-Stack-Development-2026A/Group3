// Phân quyền ABAC (Chặn tính năng Replay)
const responseHelper = require('../common/responseHelper');

const premiumMiddleware = (req, res, next) => {
	const isPremium = Boolean(req.user && req.user.isPremium);

	if (!isPremium) {
		return responseHelper.sendError(
			res,
			403,
			'PREMIUM_REQUIRED',
			'Premium subscription required to access replay.'
		);
	}

	return next();
};

module.exports = premiumMiddleware;