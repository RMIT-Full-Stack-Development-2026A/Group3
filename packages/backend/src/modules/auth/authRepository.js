import { User } from './authModel.js';

class AuthRepository {
  /**
   * Tạo người dùng mới (Register)
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Tìm người dùng theo Email (Dùng cho Login hoặc check trùng)
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() }).lean();
  }

  /**
   * Tìm người dùng theo Username (Dùng cho Login hoặc check trùng)
   */
  async findByUsername(username) {
    return await User.findOne({ username }).lean();
  }

  /**
   * Tìm người dùng theo ID (Dùng cho authMiddleware)
   * Trả về đầy đủ thông tin để check Role, isActive
   */
  async findById(id) {
    return await User.findById(id).select('-passwordHash').lean();
  }

  /**
   * Cập nhật thông tin User (Ví dụ: Update trạng thái Premium)
   */
  async updateUserInfo(userId, updateData) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after' }
    ).lean();
  }

  /**
   * Tìm người dùng bằng Email hoặc Username
   * Phục vụ cho tính năng Login linh hoạt (nhập 1 trong 2)
   */
  async findByEmailOrUsername(identifier) {
    return await User.findOne({
      $or: [
        { email: identifier.toLowerCase() }, // Chuyển về lowercase vì Schema để lowercase: true
        { username: identifier }
      ]
    }).lean();
  }
}

export default new AuthRepository();