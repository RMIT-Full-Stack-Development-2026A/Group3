class AdminDTO {
  /**
   * Chuyển đổi dữ liệu Request cập nhật trạng thái
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
   * Định dạng danh sách người dùng trả về cho Frontend
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
   * Định dạng response thành công
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
