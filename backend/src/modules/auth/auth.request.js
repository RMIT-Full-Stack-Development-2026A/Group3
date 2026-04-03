/**
 * Auth Request DTOs
 * Validation and sanitization for auth endpoints
 */

const loginRequestDTO = {
  validate: (body = {}) => {
    const safeBody = body && typeof body === 'object' ? body : {};
    const { identifier, password } = safeBody;

    if (!identifier || typeof identifier !== 'string') {
      throw new Error('identifier is required and must be a string (username or email)');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('password is required and must be a string');
    }

    return {
      identifier: identifier.trim(),
      password: password
    };
  }
};

module.exports = {
  loginRequestDTO
};
