import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/config';
import { backendApi } from '../services/backendApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      login: (userData, token) => {
        backendApi.setToken(token);
        set({
          user: userData,
          isAuthenticated: true,
          token: token,
        });
      },
      
      logout: () => {
        backendApi.clearToken();
        set({
          user: null,
          isAuthenticated: false,
          token: null,
        });
      },
      
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      // Validate and sync auth state
      validateAuth: () => {
        const token = backendApi.getToken();
        const isValid = backendApi.isAuthenticated();
        
        if (!token || !isValid) {
          get().logout();
          return false;
        }
        
        const currentUser = backendApi.getCurrentUser();
        if (currentUser && !get().user) {
          set({ 
            token, 
            isAuthenticated: true,
            user: { id: currentUser.id }
          });
        }
        
        return true;
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STATE,
    }
  )
);
