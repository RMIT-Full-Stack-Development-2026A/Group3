import httpUtil from '../../shared/utils/httpUtil';

const adminService = {
  getUsers: async () => {
    return await httpUtil.get('/admin/users');
  },
  
  updateUserStatus: async (userId, isActive) => {
    return await httpUtil.patch(`/admin/users/${userId}/status`, { isActive });
  }
};

export default adminService;
