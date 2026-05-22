import UsersRepository from './usersRepository.js';

class UsersService {

  async getPublicById(userId) {
    const user = await UsersRepository.findById(userId);
    if (!user) return null;
    
    const { _id, username, email, role, isActive, createdAt, updatedAt } = user;
    return { _id, username, email, role, isActive, createdAt, updatedAt };
  }

  async findByUsername(username) {
    return await UsersRepository.findByUsername(username);
  }

  async findByEmailOrUsername(identifier) {
    return await UsersRepository.findByEmailOrUsername(identifier);
  }

  async updateUserInfo(userId, updateData) {
    return await UsersRepository.updateUserInfo(userId, updateData);
  }

  async create(userData) {
    return await UsersRepository.create(userData);
  }
}

export default new UsersService();
