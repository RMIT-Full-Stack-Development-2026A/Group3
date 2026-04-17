class AuthDTO {
  /**
   * Validate Register Request
   */
  static transformRegisterReq(body = {}) {
    const { username, email, password, confirmPassword, country, avatarUrl } = body;

    // Basic Validation
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
      authData: {
        username: username.trim(),
        email: email.trim(),
        password: password,
      },
      profileData: {
        country: country,
        avatarUrl: avatarUrl ? avatarUrl.trim() : ''
      }
    };
  }

  /**
   * Validate Login Request
   */
  static transformLoginReq(body = {}) {
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== 'string') {
      throw new Error('identifier is required (username or email)');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('password is required');
    }

    return {
      identifier: identifier.trim(),
      password: password
    };
  }

  /**
   * Format Auth Success Response
   * Merges data from User document and Profile document
   */
  static formatAuthResponse(user, profile, token) {
    if (!user) return null;

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isPremium: profile?.isPremium === true,
        avatarUrl: profile?.avatarUrl || '',
      },
      token: token
    };
  }

  /**
   * Format Single User Response
   * Standardizes ID to 'id' for frontend consistency
   */
  static formatUserResponse(user) {
    if (!user) return null;
    
    return {
      id: user._id?.toString() || user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

export default AuthDTO;