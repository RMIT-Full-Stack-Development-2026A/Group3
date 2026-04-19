import httpUtil from '../../shared/utils/httpUtil';

const profileService = {
  getProfile: async () => {
    return await httpUtil.get('/profile/me');
  },
  updateProfile: async (data) => {
    return await httpUtil.put('/profile/me', data);
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await httpUtil.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default profileService;
