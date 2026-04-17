import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsersRepository from './usersRepository.js';
import ProfileRepository from '../profile/profileRepository.js';
import { env } from '../../configs/env.js';

class AuthService {
  /**
   * Đăng ký: Tạo User + Khởi tạo Profile
   */
  async register(data) {
    const { authData, profileData } = data;

    // 1. Kiểm tra trùng lặp
    const existingUser = await UsersRepository.findByEmailOrUsername(authData.email) ||
      await UsersRepository.findByUsername(authData.username);
    
    if (existingUser) {
      throw new Error('Username or Email already exists');
    }

    // 2. Hash mật khẩu
    const passwordHash = await bcrypt.hash(authData.password, 10);

    // 3. Tạo User
    const newUser = await UsersRepository.create({
      username: authData.username,
      email: authData.email,
      passwordHash: passwordHash,
      role: 'PLAYER',
      isActive: true
    });

    // 4. Khởi tạo Profile & Stats
    await ProfileRepository.initUserProfile(
      newUser._id,
      profileData.country || 'Vietnam',
      profileData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.username}`
    );

    return newUser;
  }

  /**
   * Đăng nhập: Kiểm tra Auth + Lấy thông tin Profile cho Token
   */
  async login(identifier, password) {
    // 1. Tìm User
    const user = await UsersRepository.findByEmailOrUsername(identifier);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account is disabled');
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Lấy Profile để lấy isPremium và avatarUrl
    const profile = await ProfileRepository.findProfileByUserId(user._id);

    // 4. Tạo token
    const token = this._generateToken(user, profile);

    return { user, profile, token };
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(userId) {
    const user = await UsersRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Tạo JWT Token (Hỗ trợ ELO/Rank sau này nếu cần)
   */
  _generateToken(user, profile) {
    const isPremium = profile?.isPremium === true;
    
    return jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isPremium: isPremium
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

export default new AuthService();