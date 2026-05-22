import { User } from './usersModel.js';

class UsersRepository {
  /**
   * Create a new user (Register)
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Find a user by Email
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Find a user by Username (Case-insensitive)
   */
  async findByUsername(username) {
    return await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).lean();
  }

  /**
   * Find a user by ID
   */
  async findById(id) {
    return await User.findById(id).select('-passwordHash').lean();
  }

  /**
   * Update user information
   */
  async updateUserInfo(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Find a user by Email or Username
   */
  async findByEmailOrUsername(identifier) {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    return await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: { $regex: new RegExp(`^${identifier.trim()}$`, 'i') } }
      ]
    });
  }

  /**
   * Retrieve all players along with their Profile info
   */
  async findAllWithProfiles() {
    return await User.aggregate([
      {
        $match: { role: 'PLAYER' }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      {
        $unwind: { path: '$profile', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          username: 1,
          email: 1,
          isActive: 1,
          isPremium: { $ifNull: ['$profile.isPremium', false] },
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
  }
}

export default new UsersRepository();
