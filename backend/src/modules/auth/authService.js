import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './authRepository.js';
import { User } from '../users/usersModel.js';
import { Profile, UserStatistic } from '../profile/profileModel.js';
import { env } from '../../configs/env.js';

class AuthService {
  /**
   * Đăng ký: Tạo User (Auth) + Khởi tạo Profile
   */
  async register(data) {
    const { authData, profileData } = data; // Dữ liệu đã được tách từ DTO

    // 1. Kiểm tra trùng lặp trước khi Hash (Tối ưu CPU)
    const existingUser = await authRepository.findByEmailOrUsername(authData.email) || 
                         await authRepository.findByUsername(authData.username);
    if (existingUser) {
      throw new Error('Username or Email already exists');
    }

    // 2. Hash mật khẩu
    const passwordHash = await bcrypt.hash(authData.password, 10);

    // 3. Tạo User trong bảng Auth
    const newUser = await authRepository.create({
      username: authData.username,
      email: authData.email,
      passwordHash: passwordHash,
      role: 'PLAYER',
      isActive: true
    });

    // 4. Khởi tạo Profile rỗng cho User mới
    // Lưu ý: Nếu có profileRepository, hãy gọi ở đây
    /* await profileRepository.create({
      userId: newUser._id,
      country: profileData.country,
      avatarUrl: profileData.avatarUrl
    }); 
    */

    return newUser;
  }

  /**
   * Đăng nhập: Kiểm tra Auth + Lấy thông tin Profile
   */
  async login(identifier, password) {
    // 1. Tìm User (Dùng hàm mới findByEmailOrUsername)
    const user = await authRepository.findByEmailOrUsername(identifier);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account is disabled');
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const profile = await Profile.findOne({ userId: user._id }).select('isPremium avatarUrl');
    const isPremium = profile?.isPremium === true;

    const tokenExpiresIn = env.JWT_EXPIRES_IN || '24h';

    // 4. Tạo JWT Token
    const token = this._generateToken(user, null); // Thay null bằng profile nếu có

    return {
      user,
      profile: null, // Thay null bằng profile nếu đã gọi Repo
      token
    };
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Hàm hỗ trợ tạo Token (Private)
   */
  _generateToken(user, profile) {
    return jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        isPremium
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '24h' }
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
}

export default new AuthService();