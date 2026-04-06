/**
 * Auth Middleware
 * Verifies JWS token and attaches decoded user context to request
 */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        errorCode: 'TOKEN_MISSING',
        message: 'Authorization token is missing. Please provide a valid JWT in the Authorization header.'
      });
    }

    const token = authHeader.slice(7);

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request context
    req.user = {
      id: decoded.id,
      role: decoded.role,
      isPremium: decoded.isPremium
    };

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Token is invalid, tampered, or expired
    let message = 'Token is invalid or expired.';
    let errorCode = 'TOKEN_INVALID';

    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please log in again.';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token is invalid or malformed.';
      errorCode = 'TOKEN_INVALID';
    }

    res.status(401).json({
      success: false,
      errorCode: errorCode,
      message: message
    });
  }
};

module.exports = authMiddleware;
