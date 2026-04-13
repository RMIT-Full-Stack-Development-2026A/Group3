import httpUtil from '../../utils/httpUtil.js';
import { useAuthStore } from '../../store/authStore.js';

/**
 * AuthService - Frontend Logic Layer
 * Handles authentication requests and updates global zustand state.
 */
const AuthService = {
  /**
   * Register a new player
   */
  async register(registerData) {
    try {
      const response = await httpUtil.post('/auth/register', registerData);
      return response;
    } catch (error) {
      console.error('Registration API Error:', error);
      throw error;
    }
  },

  /**
   * Login an existing player
   */
  async login(credentials) {
    try {
      // Map 'email' field from UI to 'identifier' required by Backend
      const payload = {
        identifier: credentials.email || credentials.identifier,
        password: credentials.password
      };

      const response = await httpUtil.post('/auth/login', payload);
      
      // If successful, update the global store
      if (response.success && response.data) {
        const { token, ...user } = response.data;
        useAuthStore.getState().setAuth(user, token);
      }
      
      return response;
    } catch (error) {

      console.error('Login API Error:', error);
      throw error;
    }
  }
};

export default AuthService;

