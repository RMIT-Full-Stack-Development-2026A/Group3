import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository.js';
import { User } from '../users/users.model.js';
import { env } from '../../configs/env.js';



export const authService = {


  register: async (data) => {
    const { username, email, password, country} = data;

    const passwordHash = await bcrypt.hash(password, 10);

    let newUser;
    try {
      newUser = await User.create({
        username: username,
        email: email,
        passwordHash: passwordHash,
        country: country,
        avatarUrl: '',
        role: 'player',
        isActive: true,
        walletBalance: 0,
        isPremium: false,
        premiumExpiry: null
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

    const tokenExpiresIn = env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isPremium: user.isPremium
      },
      env.JWT_SECRET,
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
