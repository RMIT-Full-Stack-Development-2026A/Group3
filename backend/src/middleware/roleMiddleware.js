/**
 * Role Middleware
 * RBAC (Role-Based Access Control) factory middleware
 */

/**
 * Factory function that creates a role-checking middleware
 * @param {...string} allowedRoles - Allowed role values
 * @returns {Function} Middleware function
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Assumes authMiddleware has already verified token and populated req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorCode: 'TOKEN_MISSING',
        message: 'User context not found. Please authenticate first.'
      });
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        errorCode: 'ROLE_FORBIDDEN',
        message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${userRole}.`
      });
    }

    // Role is allowed, proceed
    next();
  };
};

module.exports = roleMiddleware;
