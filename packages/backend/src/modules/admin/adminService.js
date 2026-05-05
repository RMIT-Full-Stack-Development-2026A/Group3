import UsersRepository from '../users/usersRepository.js';
import { AuditLog } from './adminModel.js';
import { User } from '../users/usersModel.js';

class AdminService {
  /**
   * Lấy danh sách tất cả người dùng kèm trạng thái Premium
   */
  async getAllUsers() {
    return await UsersRepository.findAllWithProfiles();
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng
   */
  async toggleUserStatus(adminId, targetUserId, isActive) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldValue = user.isActive;
    user.isActive = isActive;
    await user.save();

    // Ghi Audit Log
    await AuditLog.create({
      adminId,
      action: isActive ? 'UNBAN_USER' : 'BAN_USER',
      targetId: targetUserId,
      targetType: 'USER',
      oldValue: { isActive: oldValue },
      newValue: { isActive: isActive }
    });

    return user;
  }
}

export default new AdminService();
