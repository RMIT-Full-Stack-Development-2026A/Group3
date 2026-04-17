import UsersRepository from './usersRepository.js';

class UsersService {
  /**
   * Lấy thông tin công khai của người dùng theo ID
   */
  async getPublicById(userId) {
    const user = await UsersRepository.findById(userId);
    if (!user) return null;
    
    // Trả về các trường an toàn
    const { _id, username, email, role, isActive, createdAt, updatedAt } = user;
    return { _id, username, email, role, isActive, createdAt, updatedAt };
  }

  /**
   * Tìm người dùng theo username
   */
  async findByUsername(username) {
    return await UsersRepository.findByUsername(username);
  }

  /**
   * Tìm người dùng bằng Email hoặc Username
   */
  async findByEmailOrUsername(identifier) {
    return await UsersRepository.findByEmailOrUsername(identifier);
  }

  /**
   * Cập nhật thông tin User
   */
  async updateUserInfo(userId, updateData) {
    return await UsersRepository.updateUserInfo(userId, updateData);
  }

  /**
   * Tạo người dùng mới
   */
  async create(userData) {
    return await UsersRepository.create(userData);
  }
}

export default new UsersService();
