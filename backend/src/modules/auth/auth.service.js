const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');

const authService = {
  login: async (identifier, password) => {
    const user = await authRepository.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokenExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isPremium: user.isPremium
      },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenExpiresIn
      }
    );

    return {
      token,
      user
    };
  }
};

module.exports = authService;
