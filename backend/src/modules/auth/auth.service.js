const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const usersRepository = require('../users/users.repository');
const User = require('../users/users.model');

const authService = {

  register: async (data) => {
    const { username, email, password, country } = data;

    const passwordHash = await bcrypt.hash(password, 10);

    let newUser;
    try {
      newUser = await User.create({
        username: username,
        email: email,
        passwordHash: passwordHash,
        country: country,
        role: 'PLAYER',
        isPremium: false
      });
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        } else if (error.message.includes('email')) {
          throw new Error('Email already exists');
        } else {
          throw new Error('Registration failed due to duplicate data');
        }
      }
      throw error; // Re-throw other errors
    }

    return newUser;
  },


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
