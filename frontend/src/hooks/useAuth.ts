'use client';

import { useState, useEffect } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await api.get('/api/v1/auth/me');
      setAuthState({
        user: response.data.data,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = async (credentials: LoginForm) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      const { token, user } = response.data.data;
      
      localStorage.setItem('auth_token', token);
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await api.put('/api/v1/auth/profile', profileData);
      setAuthState(prev => ({
        ...prev,
        user: response.data.data,
      }));
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };
}