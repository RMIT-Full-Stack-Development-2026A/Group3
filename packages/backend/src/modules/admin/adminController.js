import AdminService from './adminService.js';
import AdminDTO from './adminDto.js';

class AdminController {
  /**
   * GET /api/admin/users
   */
  async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();
      
      const formattedUsers = AdminDTO.formatUserListResponse(users);
      
      res.json(AdminDTO.formatSuccessResponse('Users retrieved successfully', formattedUsers));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   */
  async updateUserStatus(req, res) {
    try {
      // 1. DTO xử lý validate và transform dữ liệu
      const { targetUserId, isActive } = AdminDTO.transformUpdateStatusReq(req.params, req.body);
      const adminId = req.user.id;

      // 2. Gọi Service xử lý nghiệp vụ
      await AdminService.toggleUserStatus(adminId, targetUserId, isActive);

      // 3. DTO định dạng response trả về
      res.json(AdminDTO.formatSuccessResponse(
        `User account has been ${isActive ? 'activated' : 'deactivated'} successfully.`
      ));
    } catch (error) {
      const status = error.message === 'User not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/admin/rooms
   */
  async getRooms(req, res) {
    try {
      // 1. DTO transform & validate query parameters
      const filter = AdminDTO.transformGetRoomsQuery(req.query);

      // 2. Gọi Service xử lý
      const { rooms, pagination } = await AdminService.getRooms(filter);

      // 3. Định dạng response trả về qua DTO
      const formattedRooms = AdminDTO.formatRoomListResponse(rooms);

      res.json(AdminDTO.formatSuccessResponse('Rooms retrieved successfully', {
        rooms: formattedRooms,
        pagination
      }));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/admin/rooms/:id/close
   */
  async closeRoom(req, res) {
    try {
      const roomId = req.params.id;
      const { reason } = req.body;
      const adminId = req.user.id;

      if (!roomId) {
        throw new Error('Room ID is required');
      }

      // Gọi Service đóng phòng đấu
      const closedRoom = await AdminService.closeRoom(adminId, roomId, reason);

      res.json(AdminDTO.formatSuccessResponse(
        `Room ${closedRoom.roomCode} has been closed successfully.`
      ));
    } catch (error) {
      const status = error.message === 'Room not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AdminController();
