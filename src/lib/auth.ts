import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;
          
          // Store token in cookie
          Cookies.set('cms_token', token, { expires: 7 });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const { token, user } = response.data;
          
          // Store token in cookie
          Cookies.set('cms_token', token, { expires: 7 });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('cms_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = Cookies.get('cms_token');
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe();
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid
          Cookies.remove('cms_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await authAPI.updateProfile(data);
          set({ user: response.data.user });
        } catch (error) {
          throw error;
        }
      },

      changePassword: async (data) => {
        try {
          await authAPI.changePassword(data);
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'cms-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Hook for role-based access control
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  return {
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor' || user?.role === 'admin',
    isViewer: !!user,
    canCreate: user?.role === 'editor' || user?.role === 'admin',
    canEdit: user?.role === 'editor' || user?.role === 'admin',
    canDelete: user?.role === 'admin',
    canManageUsers: user?.role === 'admin',
    canManageMedia: user?.role === 'editor' || user?.role === 'admin',
  };
};