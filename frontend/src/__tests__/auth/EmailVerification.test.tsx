import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { EmailVerification } from '@/components/auth/EmailVerification';

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

const mockVerifyEmail = jest.fn();
const mockRefreshAuth = jest.fn();

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      isVerified: false,
      preferences: {
        notifications: { email: true, push: true, sms: false, frequency: 'daily', types: { assessment: true, community: true, educational: true, reminders: true } },
        privacy: { profileVisibility: 'private', dataSharing: false, analyticsOptOut: false, communityParticipation: true },
        accessibility: { fontSize: 'medium', highContrast: false, textToSpeech: false, keyboardNavigation: false, reducedMotion: false },
        theme: 'system'
      },
      createdAt: new Date(),
    },
    isLoading: false,
    isAuthenticated: true,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: mockVerifyEmail,
    refreshAuth: mockRefreshAuth,
  }),
}));

const renderEmailVerification = (props = {}) => {
  return render(<EmailVerification {...props} />);
};

describe('EmailVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('token');
  });

  describe('Pending Mode', () => {
    it('renders pending verification message by default', () => {
      renderEmailVerification();

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification email to:/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });

    it('renders pending mode when mode prop is pending', () => {
      renderEmailVerification({ mode: 'pending' });

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification email to:/i)).toBeInTheDocument();
    });

    it('handles resend verification email', async () => {
      renderEmailVerification();

      const resendButton = screen.getByRole('button', { name: /resend verification email/i });
      fireEvent.click(resendButton);

      expect(screen.getByText(/sending.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('renders back to login link', () => {
      renderEmailVerification();

      const backLink = screen.getByRole('link', { name: /back to login/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('Verify Mode', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'verification-token');
    });

    it('automatically verifies email when token is present', async () => {
      mockVerifyEmail.mockResolvedValue({ success: true });
      mockRefreshAuth.mockResolvedValue(undefined);

      renderEmailVerification({ mode: 'verify' });

      expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('verification-token');
        expect(mockRefreshAuth).toHaveBeenCalled();
      });
    });

    it('shows success message after successful verification', async () => {
      mockVerifyEmail.mockResolvedValue({ success: true });
      mockRefreshAuth.mockResolvedValue(undefined);

      renderEmailVerification({ mode: 'verify' });

      await waitFor(() => {
        expect(screen.getByText(/email verified successfully!/i)).toBeInTheDocument();
        expect(screen.getByText(/your email address has been verified/i)).toBeInTheDocument();
      });

      const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('shows error message on verification failure', async () => {
      mockVerifyEmail.mockResolvedValue({
        success: false,
        error: 'Invalid verification token'
      });

      renderEmailVerification({ mode: 'verify' });

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid verification token/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });

    it('shows loading state during verification', () => {
      mockVerifyEmail.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      renderEmailVerification({ mode: 'verify' });

      expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait while we verify/i)).toBeInTheDocument();
    });

    it('handles verification error gracefully', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Network error'));

      renderEmailVerification({ mode: 'verify' });

      await waitFor(() => {
        expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
        expect(screen.getByText(/an unexpected error occurred during verification/i)).toBeInTheDocument();
      });
    });
  });

  describe('Token detection', () => {
    it('switches to verify mode when token is present in URL', async () => {
      mockSearchParams.set('token', 'auto-verify-token');
      mockVerifyEmail.mockResolvedValue({ success: true });

      renderEmailVerification(); // Default mode but token present

      await waitFor(() => {
        expect(mockVerifyEmail).toHaveBeenCalledWith('auto-verify-token');
      });
    });

    it('stays in pending mode when no token is present', () => {
      renderEmailVerification({ mode: 'verify' }); // Verify mode but no token

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      expect(mockVerifyEmail).not.toHaveBeenCalled();
    });
  });
});