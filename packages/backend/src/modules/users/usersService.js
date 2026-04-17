import UsersRepository from './usersRepository.js';

class UsersService {
  /**
   * Lấy thông tin công khai của người dùng theo ID
   */
  async getPublicById(userId) {
    const user = await UsersRepository.findById(userId);
    if (!user) return null;
    
    // Chỉ trả về các trường cần thiết (Security)
    const { _id, username, email, role, isActive, createdAt, updatedAt } = user;
    return { _id, username, email, role, isActive, createdAt, updatedAt };
  }
}

export default new UsersService();
