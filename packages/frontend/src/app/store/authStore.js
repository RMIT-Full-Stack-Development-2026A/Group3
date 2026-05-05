import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      actions: {
        setAuth: (user, token) => set({ 
          user, 
          token, 
          isAuthenticated: !!token && !!user 
        }),
        
        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('auth-storage'); 
        },
        
        updateUser: (updatedUser) => set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null
        })),
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthActions = () => useAuthStore((state) => state.actions);
