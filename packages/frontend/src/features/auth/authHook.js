import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from './authService.js';
import { useAuthStore } from '../../store/authStore.js';

/**
 * useAuth - Custom hook for Auth logic
 * Provides a clean interface for Login and Register components.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      if (response.success) {
        navigate('/dashboard');
        return true;
      }
      return false;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (registerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(registerData);
      if (response.success) {
        navigate('/'); // Redirect to login after registration
        return true;
      }
      return false;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    AuthService.logout();
    navigate('/');
  }, [navigate]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  };
};
