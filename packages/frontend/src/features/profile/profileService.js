import httpUtil from '../../shared/utils/httpUtil';

const profileService = {
  getProfile: async () => {
    return await httpUtil.get('/profile/me');
  },
  updateProfile: async (data) => {
    return await httpUtil.put('/profile/me', data);
  },
  uploadToCloudinary: async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary config missing in .env');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    return await response.json();
  }
};

export default profileService;
