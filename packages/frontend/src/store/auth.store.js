import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AuthStore - Central Intelligence for User Session.
 * Part of Layer 5 (Middleware/Infrastructure).
 * Handles JWT persistence in LocalStorage.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Action: Login success
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),

      // Action: Logout / Clear session
      clearAuth: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),

      // Action: Update user profile info
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),
    }),
    {
      name: 'tictactoang-auth-storage', // Key in LocalStorage
    }
  )
);
