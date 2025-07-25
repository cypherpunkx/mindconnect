'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginForm, RegisterForm, PasswordResetForm } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterForm) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (data: PasswordResetForm) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await authApi.refreshToken();
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginForm): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials.email, credentials.password);
      
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.token && data.user) {
          localStorage.setItem('auth_token', data.token);
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true };
        }
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterForm): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authApi.register({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        dateOfBirth: userData.dateOfBirth,
      });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const forgotPassword = async (data: PasswordResetForm): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.forgotPassword(data.email);
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Password reset request failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset request failed' };
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.resetPassword(token, password);
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Password reset failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.verifyEmail(token);
      if (response.success) {
        // Refresh user data after email verification
        await refreshAuth();
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Email verification failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Email verification failed' };
    }
  };

  const refreshAuth = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}