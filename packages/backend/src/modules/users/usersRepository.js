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
    }).lean();
  }
}

export default new UsersRepository();
