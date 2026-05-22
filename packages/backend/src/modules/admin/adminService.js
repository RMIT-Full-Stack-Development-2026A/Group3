import UsersRepository from '../users/usersRepository.js';
import { AuditLog } from './adminModel.js';
import { User } from '../users/usersModel.js';
import { GameRoom } from '../arena/arenaModel.js';
import { GameSession } from '../game/gameModel.js';
import { getIO } from '@tictactoang/shared/utils/socketManager.js';

class AdminService {
  /**
   * Retrieve all users along with their premium profiles
   */
  async getAllUsers() {
    return await UsersRepository.findAllWithProfiles();
  }

  /**
   * Ban or Unban a user account by updating their active status
   */
  async toggleUserStatus(adminId, targetUserId, isActive) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldValue = user.isActive;
    user.isActive = isActive;
    await user.save();

    // Create Audit Log record
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
   * Retrieve paginated game rooms with search and filtering
   */
  async getRooms({ page, limit, search, status }) {
    const query = {};

    // Handle status filtering
    if (status === 'online') {
      query.status = { $in: ['WAITING', 'PLAYING'] };
    } else if (status !== 'all') {
      query.status = status;
    }

    // Handle search query for room code or player names
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
   * Force-close a game room and abort the online match via Socket.IO
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

    // 1. Update GameRoom status
    room.status = 'CLOSED';
    room.endTime = now;
    await room.save();

    // 2. Abort the associated GameSession if active
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

    // 3. Create Audit Log for CLOSE_ROOM action
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
      
      // Broadcast force-closed event to clients in the room
      io.to(roomChannelName).emit('arena:force-closed', {
        message: 'This game room has been Force Closed by the admin.',
        reason: reason || '',
        roomId: room._id.toString(),
        roomCode: room.roomCode,
        sessionId: room.sessionId?.toString() || null,
        status: room.status,
        sessionStatus: closedSession?.status || 'ABORTED'
      });

      // Broadcast room status update to Lobby
      io.emit('arena:room-updated', {
        roomCode: room.roomCode,
        status: 'CLOSED'
      });

      // Cleanup: Force all clients to leave the room channel
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
