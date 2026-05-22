class AdminDTO {
  /**
   * Transform and validate the status update request body
   */
  static transformUpdateStatusReq(params, body) {
    const { id } = params;
    const { isActive } = body;

    if (!id) {
      throw new Error('User ID is required');
    }

    if (typeof isActive !== 'boolean') {
      throw new Error('isActive must be a boolean');
    }

    return {
      targetUserId: id,
      isActive: isActive
    };
  }

  /**
   * Format the user list response payload for the frontend
   */
  static formatUserListResponse(users) {
    if (!Array.isArray(users)) return [];

    return users.map(user => ({
      id: user._id?.toString() || user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      isPremium: user.isPremium === true,
      createdAt: user.createdAt
    }));
  }

  /**
   * Transform and validate the query parameters for retrieving rooms
   */
  static transformGetRoomsQuery(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(parseInt(query.limit) || 20, 100));
    const search = query.search ? String(query.search).trim() : '';
    const status = query.status ? String(query.status).trim() : 'online';

    return {
      page,
      limit,
      search,
      status
    };
  }

  /**
   * Format the room list response payload for the frontend
   */
  static formatRoomListResponse(rooms) {
    if (!Array.isArray(rooms)) return [];

    return rooms.map(room => ({
      id: room._id?.toString() || room.id,
      roomCode: room.roomCode,
      player1Name: room.player1Name,
      player2Name: room.player2Name || 'Waiting for opponent...',
      status: room.status,
      startTime: room.createdAt,
      endTime: room.endTime || null
    }));
  }

  /**
   * Helper function to format a standardized success response
   */
  static formatSuccessResponse(message, data = null) {
    const response = {
      success: true,
      message: message
    };

    if (data) {
      response.data = data;
    }

    return response;
  }
}

export default AdminDTO;
