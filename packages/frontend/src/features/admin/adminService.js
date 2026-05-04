import httpUtil from '../../shared/utils/httpUtil';

const adminService = {
  getUsers: async () => {
    return await httpUtil.get('/admin/users');
  },
  
  updateUserStatus: async (userId, status) => {
    return await httpUtil.patch(`/admin/users/${userId}/status`, { status });
  }
};

export default adminService;
