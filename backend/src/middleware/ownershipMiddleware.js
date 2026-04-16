const ownershipMiddleware = (paramName = 'id') => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				errorCode: 'TOKEN_MISSING',
				message: 'User context not found. Please authenticate first.'
			});
		}

		if (req.user.role === 'ADMIN') {
			return next();
		}

		const ownerId = req.params[paramName];
		if (!ownerId || req.user.id !== ownerId) {
			return res.status(403).json({
				success: false,
				errorCode: 'OWNERSHIP_DENIED',
				message: 'You can only access your own resources.'
			});
		}

		next();
	};
};

export default ownershipMiddleware;