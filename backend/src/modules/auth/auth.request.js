/**
 * Auth Request DTOs
 * Validation and sanitization for auth endpoints
 */


const registerRequestDTO = {
  validate: (body = {}) => {
    const safeBody = body && typeof body === 'object' ? body : {};

    const { username, email, password, confirmPassword, country } = safeBody;

    if (!username || typeof username !== 'string') {
      throw new Error('username is required and must be a string');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error('username can only contain letters, numbers, _ and -');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('invalid email format');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('password is required');
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      throw new Error(
        'password must be at least 8 chars, include uppercase, number, special char'
      );
    }

    if (password !== confirmPassword) {
      throw new Error('confirm password does not match');
    }

    if (!country) {
      throw new Error('country is required');
    }

    return {
      username: username.trim(),
      email: email.trim(),
      password,
      country
    };
  }
};

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
  loginRequestDTO,
  registerRequestDTO
};
