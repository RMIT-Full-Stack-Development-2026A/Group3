import axios from 'axios';
import { API_CONFIG } from '../configs/api.config.js';
import { useAuthStore } from '../store/auth.store.js';

/**
 * httpUtil - The Middleware Networking Layer.
 * Provides a standardized Axios instance with JWT Interceptors.
 */
const httpUtil = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Inject JWT Token from LocalStorage (AuthStore)
httpUtil.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Standardization for Backend Middleware
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Global Error Handling (e.g., 401 Redirect)
httpUtil.interceptors.response.use(
  (response) => response.data, // Strip the axios wrap to get raw data
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - Session expired or invalid
      console.warn('Session expired. Clearing auth state.');
      useAuthStore.getState().clearAuth();
      // Optionally: Redirect to Login if needed
    }
    return Promise.reject(error);
  }
);

export default httpUtil;
