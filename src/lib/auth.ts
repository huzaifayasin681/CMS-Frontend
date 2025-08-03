import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
  phone?: string;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  emailVerificationPending: boolean;
  login: (credentials: { login: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  uploadAvatar: (file: File) => Promise<any>;
  changePassword: (data: any) => Promise<void>;
  // Email verification methods
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      emailVerificationPending: false,

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
            emailVerificationPending: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          
          // Check if error is due to unverified email
          if (error.response?.data?.emailVerified === false) {
            set({ emailVerificationPending: true });
          }
          
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(userData);
          const { user } = response.data;
          
          // No token returned - email verification required
          set({
            user,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            emailVerificationPending: true,
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
          emailVerificationPending: false,
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

      uploadAvatar: async (file: File) => {
        try {
          const response = await authAPI.uploadAvatar(file);
          // Update user with new avatar URL
          set({ user: response.data.user });
          return response.data.media;
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

      verifyEmail: async (token: string) => {
        set({ isLoading: true });
        try {
          await authAPI.verifyEmail(token);
          set({ 
            isLoading: false,
            emailVerificationPending: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true });
        try {
          await authAPI.resendVerification({ email });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          await authAPI.forgotPassword({ email });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await authAPI.resetPassword({ token, newPassword });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'cms-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        emailVerificationPending: state.emailVerificationPending
      }),
    }
  )
);

// Hook for role-based access control
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  return {
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isEditor: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
    isViewer: !!user,
    canCreate: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
    canEdit: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
    canDelete: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
    canManageUsers: user?.role === 'admin' || user?.role === 'superadmin',
    canManageMedia: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
    canManageSettings: user?.role === 'admin' || user?.role === 'superadmin',
    canViewAnalytics: user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin',
  };
};