const premiumMiddleware = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			errorCode: 'TOKEN_MISSING',
			message: 'User context not found. Please authenticate first.'
		});
	}

	if (req.user.isPremium !== true) {
		return res.status(403).json({
			success: false,
			errorCode: 'PREMIUM_REQUIRED',
			message: 'This feature requires an active premium subscription.'
		});
	}

	next();
};

module.exports = premiumMiddleware;