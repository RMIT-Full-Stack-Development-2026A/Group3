import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './authRepository.js';
import { User } from '../users/usersModel.js';
import { Profile, UserStatistic } from '../profile/profileModel.js';
import { env } from '../../configs/env.js';



export const authService = {


  register: async (data) => {
    const { username, email, password, country, avatarUrl } = data;

    const passwordHash = await bcrypt.hash(password, 10);

    let newUser;
    try {
      newUser = await User.create({
        username: username,
        email: email,
        passwordHash: passwordHash,
        role: 'PLAYER',
        isActive: true
      });

      // Keep profile-specific attributes in Profile collection.
      await Profile.create({
        userId: newUser._id,
        country,
        avatarUrl: avatarUrl || '',
        isPremium: false,
        walletBalance: 0,
        premiumExpiry: null
      });

      await UserStatistic.create({ userId: newUser._id });
    } catch (error) {
      if (newUser?._id) {
        await User.findByIdAndDelete(newUser._id).catch(() => null);
      }
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

    return {
      ...newUser.toObject(),
      isPremium: false,
      avatarUrl: avatarUrl || ''
    };
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

    const profile = await Profile.findOne({ userId: user._id }).select('isPremium avatarUrl');
    const isPremium = profile?.isPremium === true;

    const tokenExpiresIn = env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isPremium
      },
      env.JWT_SECRET,
      {
        expiresIn: tokenExpiresIn
      }
    );


    return {
      token,
      user: {
        ...user.toObject(),
        isPremium,
        avatarUrl: profile?.avatarUrl || ''
      }
    };
  }
};

