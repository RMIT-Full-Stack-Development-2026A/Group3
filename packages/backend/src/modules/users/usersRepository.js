import { User } from './usersModel.js';

class UsersRepository {
  /**
   * Tạo người dùng mới (Register)
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Tìm người dùng theo Email
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Tìm người dùng theo Username (Không phân biệt hoa thường)
   */
  async findByUsername(username) {
    return await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).lean();
  }

  /**
   * Tìm người dùng theo ID
   */
  async findById(id) {
    return await User.findById(id).select('-passwordHash').lean();
  }

  /**
   * Cập nhật thông tin User
   */
  async updateUserInfo(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Tìm người dùng bằng Email hoặc Username
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
   * Lấy tất cả Player cùng với thông tin Profile (Premium status)
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
