// Phân quyền ABAC (Chặn tính năng Replay)
import responseHelper from '../common/responseHelper.js';

const premiumMiddleware = (req, res, next) => {
	const role = String((req.user && req.user.role) || '').toUpperCase();

	if (role === 'ADMIN') {
		return next();
	}

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

export default premiumMiddleware;