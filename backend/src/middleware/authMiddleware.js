// Xác thực JWT token
const jwt = require('jsonwebtoken');
const responseHelper = require('../common/responseHelper');

const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization || '';

	if (!authHeader.startsWith('Bearer ')) {
		return responseHelper.sendError(res, 401, 'TOKEN_MISSING', 'Authorization token is required.');
	}

	const token = authHeader.slice(7).trim();

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
		req.user = {
			id: decoded.id || decoded.userId || decoded._id,
			role: decoded.role || 'PLAYER',
			isPremium: Boolean(decoded.isPremium)
		};

		if (!req.user.id) {
			return responseHelper.sendError(res, 401, 'TOKEN_INVALID', 'Token payload is missing user id.');
		}

		return next();
	} catch (error) {
		const isExpired = error && error.name === 'TokenExpiredError';
		return responseHelper.sendError(
			res,
			401,
			isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
			isExpired ? 'Token has expired. Please login again.' : 'Invalid authorization token.'
		);
	}
};

module.exports = authMiddleware;