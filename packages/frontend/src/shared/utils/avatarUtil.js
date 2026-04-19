import { API_CONFIG } from '../../configs/apiConfig';

export const getAvatarUrl = (url, size = 200) => {
  if (!url) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=Kaelen`;
  }
  
  // Cloudinary Transformation Optimization
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,g_face,q_auto,f_auto/`);
  }
  
  if (url.startsWith('http')) {
    return url;
  }
  
  const serverBase = API_CONFIG.BASE_URL.replace('/api/v1', '');
  return `${serverBase}${url}`;
};
