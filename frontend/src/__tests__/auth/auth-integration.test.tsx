import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { LoginForm, RegisterForm, PasswordReset } from '@/components/auth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock the auth API
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn().mockResolvedValue({ success: true }),
    register: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn(),
    forgotPassword: jest.fn().mockResolvedValue({ success: true }),
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
    verifyEmail: jest.fn().mockResolvedValue({ success: true }),
    refreshAuth: jest.fn(),
  }),
}));

describe('Authentication Components Integration', () => {
  describe('LoginForm', () => {
    it('renders without crashing', () => {
      render(<LoginForm />);
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      render(<LoginForm />);
      
      // Check for form elements
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
      
      // Check for links
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up here/i })).toBeInTheDocument();
    });
  });

  describe('RegisterForm', () => {
    it('renders without crashing', () => {
      render(<RegisterForm />);
      expect(screen.getByText(/join mindconnect/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      render(<RegisterForm />);
      
      // Check for form elements
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/date of birth/i)).toHaveAttribute('type', 'date');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
      
      // Check for terms checkbox
      expect(screen.getByRole('checkbox', { name: /i agree to the/i })).toBeInTheDocument();
      
      // Check for links
      expect(screen.getByRole('link', { name: /sign in here/i })).toBeInTheDocument();
    });
  });

  describe('PasswordReset', () => {
    it('renders forgot password form by default', () => {
      render(<PasswordReset />);
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('renders reset password form when in reset mode', () => {
      render(<PasswordReset mode="reset" />);
      expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
});