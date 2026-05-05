// Phân quyền RBAC (PLAYER / ADMIN)
import responseHelper from '../common/responseHelper.js';

const roleMiddleware = (...allowedRoles) => {
	const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

	return (req, res, next) => {
		const userRole = String((req.user && req.user.role) || '').toUpperCase();

		if (!userRole) {
			return responseHelper.sendError(res, 401, 'UNAUTHORIZED', 'User context is missing.');
		}

		if (!normalizedAllowedRoles.includes(userRole)) {
			return responseHelper.sendError(
				res,
				403,
				'FORBIDDEN_ROLE',
				`Access denied. Required role: ${normalizedAllowedRoles.join(' or ')}`
			);
		}

		return next();
	};
};

export default roleMiddleware;