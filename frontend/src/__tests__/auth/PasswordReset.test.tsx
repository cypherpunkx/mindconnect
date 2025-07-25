import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { PasswordReset } from '@/components/auth/PasswordReset';

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockForgotPassword = jest.fn();
const mockResetPassword = jest.fn();

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: mockForgotPassword,
    resetPassword: mockResetPassword,
    verifyEmail: jest.fn(),
    refreshAuth: jest.fn(),
  }),
}));

const renderPasswordReset = (props = {}) => {
  return render(<PasswordReset {...props} />);
};

describe('PasswordReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('token');
  });

  describe('Forgot Password Mode', () => {
    it('renders forgot password form by default', () => {
      renderPasswordReset();

      expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('validates email field', async () => {
      renderPasswordReset();

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('enables submit button when email is valid', async () => {
      renderPasswordReset();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      expect(submitButton).toBeDisabled();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('shows success message after successful forgot password request', async () => {
      mockForgotPassword.mockResolvedValue({ success: true });

      renderPasswordReset();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
      });

      expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('displays error message on forgot password failure', async () => {
      mockForgotPassword.mockResolvedValue({
        success: false,
        error: 'Email not found'
      });

      renderPasswordReset();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument();
      });
    });

    it('renders back to login link', () => {
      renderPasswordReset();

      const backLink = screen.getByRole('link', { name: /back to login/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('Reset Password Mode', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'reset-token');
    });

    it('renders reset password form when token is present', () => {
      renderPasswordReset();

      expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('validates password fields', async () => {
      renderPasswordReset();

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation match', async () => {
      renderPasswordReset();

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);

      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });
      fireEvent.blur(confirmPasswordInput);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    it('toggles password visibility', () => {
      renderPasswordReset();

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icon buttons

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Toggle password visibility
      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle confirm password visibility
      fireEvent.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('shows success message after successful password reset', async () => {
      mockResetPassword.mockResolvedValue({ success: true });

      renderPasswordReset();

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
        expect(screen.getByText(/your password has been successfully reset/i)).toBeInTheDocument();
      });

      expect(mockResetPassword).toHaveBeenCalledWith('reset-token', 'Password123');
    });

    it('displays error message on password reset failure', async () => {
      mockResetPassword.mockResolvedValue({
        success: false,
        error: 'Invalid or expired token'
      });

      renderPasswordReset();

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mode prop', () => {
    it('renders reset form when mode is reset', () => {
      renderPasswordReset({ mode: 'reset' });

      expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
    });

    it('renders forgot form when mode is forgot', () => {
      renderPasswordReset({ mode: 'forgot' });

      expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    });
  });
});