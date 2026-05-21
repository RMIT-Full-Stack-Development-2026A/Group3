import UsersRepository from '../users/usersRepository.js';
import { AuditLog } from './adminModel.js';
import { User } from '../users/usersModel.js';
import { GameRoom } from '../arena/arenaModel.js';
import { GameSession } from '../game/gameModel.js';
import { getIO } from '@tictactoang/shared/utils/socketManager.js';

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

  /**
   * Lấy danh sách phòng chơi và hỗ trợ tìm kiếm, phân trang
   */
  async getRooms({ page, limit, search, status }) {
    const query = {};

    // Xử lý bộ lọc trạng thái status
    if (status === 'online') {
      query.status = { $in: ['WAITING', 'PLAYING'] };
    } else if (status !== 'all') {
      query.status = status;
    }

    // Xử lý tìm kiếm theo mã phòng hoặc tên người chơi (Player 1 hoặc Player 2)
    if (search) {
      query.$or = [
        { roomCode: { $regex: search, $options: 'i' } },
        { player1Name: { $regex: search, $options: 'i' } },
        { player2Name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [rooms, totalItems] = await Promise.all([
      GameRoom.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameRoom.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      rooms,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && totalPages > 0
      }
    };
  }

  /**
   * Force-close phòng đấu và hủy trận đấu trực tuyến thông qua socket
   */
  async closeRoom(adminId, roomId, reason = '') {
    const room = await GameRoom.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status === 'CLOSED') {
      throw new Error('Room is already closed');
    }

    const oldStatus = room.status;
    const now = new Date();

    // 1. Cập nhật GameRoom
    room.status = 'CLOSED';
    room.endTime = now;
    await room.save();

    // 2. Cập nhật GameSession tương ứng nếu có
    let closedSession = null;
    if (room.sessionId) {
      const session = await GameSession.findById(room.sessionId);
      if (session && !['DRAW', 'ABORTED', 'COMPLETED'].includes(session.status)) {
        session.status = 'ABORTED';
        session.endTime = now;
        closedSession = await session.save();
      } else {
        closedSession = session;
      }
    }

    // 3. Ghi Audit Log cho hành động CLOSE_ROOM
    await AuditLog.create({
      adminId,
      action: 'CLOSE_ROOM',
      targetId: roomId,
      targetType: 'ROOM',
      oldValue: { status: oldStatus },
      newValue: { status: 'CLOSED' },
      reason: reason || 'Force closed by Admin'
    });

    // 4. Socket.io Realtime Broadcast & Cleanup
    const io = getIO();
    if (io) {
      const roomChannelName = `room-${room.roomCode}`;
      
      // Gửi sự kiện force-closed tới các client trong room
      io.to(roomChannelName).emit('arena:force-closed', {
        message: 'This game room has been Force Closed by the admin.',
        reason: reason || '',
        roomId: room._id.toString(),
        roomCode: room.roomCode,
        sessionId: room.sessionId?.toString() || null,
        status: room.status,
        sessionStatus: closedSession?.status || 'ABORTED'
      });

      // Phát sự kiện cập nhật trạng thái phòng ra Lobby
      io.emit('arena:room-updated', {
        roomCode: room.roomCode,
        status: 'CLOSED'
      });

      // Cleanup: Cho tất cả client rời khỏi room channel đó
      const roomSockets = io.sockets.adapter.rooms.get(roomChannelName);
      if (roomSockets) {
        for (const socketId of roomSockets) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.leave(roomChannelName);
          }
        }
      }
    }

    return room;
  }
}

export default new AdminService();
