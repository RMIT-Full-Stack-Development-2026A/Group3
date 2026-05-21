import httpUtil from '../../shared/utils/httpUtil';

const adminService = {
  getUsers: async () => {
    return await httpUtil.get('/admin/users');
  },
  
  updateUserStatus: async (userId, isActive) => {
    return await httpUtil.patch(`/admin/users/${userId}/status`, { isActive });
  },

  getRooms: async (params = {}) => {
    return await httpUtil.get('/admin/rooms', { params });
  },

  closeRoom: async (roomId, reason = 'Admin terminated') => {
    return await httpUtil.post(`/admin/rooms/${roomId}/close`, { reason });
  }
};

export default adminService;
