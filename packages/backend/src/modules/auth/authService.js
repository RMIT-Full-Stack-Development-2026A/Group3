import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsersService from '../users/usersService.js';
import ProfileRepository from '../profile/profileRepository.js';
import env from '../../configs/env.js';

class AuthService {
  /**
   * Register: Create a new User and initialize their Profile
   */
  async register(data) {
    const { authData, profileData } = data;

    // 1. Check for duplicates
    const existingUser = await UsersService.findByEmailOrUsername(authData.email) ||
      await UsersService.findByUsername(authData.username);
    
    if (existingUser) {
      throw new Error('Username or Email already exists');
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(authData.password, 10);

    // 3. Create the user
    const newUser = await UsersService.create({
      username: authData.username,
      email: authData.email,
      passwordHash: passwordHash,
      role: 'PLAYER',
      isActive: true
    });

    // 4. Initialize Profile & Stats
    await ProfileRepository.initUserProfile(
      newUser._id,
      profileData.country || 'Vietnam',
      profileData.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.username}`
    );

    return newUser;
  }

  /**
   * Login: Authenticate User and generate JWT Token with Profile info
   */
  async login(identifier, password) {
    // 1. Find User by identifier
    const user = await UsersService.findByEmailOrUsername(identifier);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account is disabled');
    }

    // 2. Check if account is locked (Level 2 Brute-force)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
      throw new Error(`Account is temporarily locked. Please try again after ${remainingTime} seconds.`);
    }

    // 3. Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.loginAttempts += 1;
      
      // If 5 failed attempts -> Lock for 60 seconds
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 60 * 1000);
      }
      
      await user.save();
      throw new Error('Invalid credentials');
    }

    // 4. Login success -> Reset lock status
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // 5. Get profile to get isPremium and avatarUrl
    const profile = await ProfileRepository.findProfileByUserId(user._id);

    // 6. Create token
    const token = this._generateToken(user, profile);

    return { user, profile, token };
  }

  /**
   * Retrieve user info by ID
   */
  async getUserById(userId) {
    const user = await UsersService.getPublicById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Generate JWT Token
   */
  _generateToken(user, profile) {
    const isPremium = profile?.isPremium === true;
    
    return jwt.sign(
      {
        id: (user._id || user.id).toString(),
        role: user.role,
        isPremium: isPremium
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

export default new AuthService();