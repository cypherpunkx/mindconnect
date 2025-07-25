import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ProtectedRoute, RequireAuth, GuestOnly } from '@/components/auth/ProtectedRoute';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock AuthContext
const mockAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  refreshAuth: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.user = null;
    mockAuthContext.isLoading = false;
    mockAuthContext.isAuthenticated = false;
  });

  describe('when loading', () => {
    it('shows loading state', () => {
      mockAuthContext.isLoading = true;

      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    });

    it('shows custom fallback when provided', () => {
      mockAuthContext.isLoading = true;

      render(
        <ProtectedRoute fallback={<div>Custom Loading</div>}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/custom loading/i)).toBeInTheDocument();
    });
  });

  describe('when authentication is required', () => {
    it('redirects unauthenticated users to login', () => {
      mockAuthContext.isAuthenticated = false;

      render(
        <ProtectedRoute requireAuth={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockPush).toHaveBeenCalledWith('/auth/login');
      expect(screen.getByText(/redirecting to login.../i)).toBeInTheDocument();
    });

    it('renders content for authenticated users', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isVerified: true,
        preferences: {
          notifications: { email: true, push: true, sms: false, frequency: 'daily', types: { assessment: true, community: true, educational: true, reminders: true } },
          privacy: { profileVisibility: 'private', dataSharing: false, analyticsOptOut: false, communityParticipation: true },
          accessibility: { fontSize: 'medium', highContrast: false, textToSpeech: false, keyboardNavigation: false, reducedMotion: false },
          theme: 'system'
        },
        createdAt: new Date(),
      };

      render(
        <ProtectedRoute requireAuth={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('uses custom redirect path', () => {
      mockAuthContext.isAuthenticated = false;

      render(
        <ProtectedRoute requireAuth={true} redirectTo="/custom-login">
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });

  describe('when email verification is required', () => {
    it('redirects unverified users to verification page', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
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
      };

      render(
        <ProtectedRoute requireAuth={true} requireVerification={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockPush).toHaveBeenCalledWith('/auth/verify-email');
      expect(screen.getByText(/redirecting to email verification.../i)).toBeInTheDocument();
    });

    it('renders content for verified users', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isVerified: true,
        preferences: {
          notifications: { email: true, push: true, sms: false, frequency: 'daily', types: { assessment: true, community: true, educational: true, reminders: true } },
          privacy: { profileVisibility: 'private', dataSharing: false, analyticsOptOut: false, communityParticipation: true },
          accessibility: { fontSize: 'medium', highContrast: false, textToSpeech: false, keyboardNavigation: false, reducedMotion: false },
          theme: 'system'
        },
        createdAt: new Date(),
      };

      render(
        <ProtectedRoute requireAuth={true} requireVerification={true}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('when authentication is not required (guest pages)', () => {
    it('redirects authenticated users to dashboard', () => {
      mockAuthContext.isAuthenticated = true;

      render(
        <ProtectedRoute requireAuth={false}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(screen.getByText(/redirecting to dashboard.../i)).toBeInTheDocument();
    });

    it('renders content for unauthenticated users', () => {
      mockAuthContext.isAuthenticated = false;

      render(
        <ProtectedRoute requireAuth={false}>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});

describe('RequireAuth wrapper', () => {
  it('requires authentication by default', () => {
    mockAuthContext.isAuthenticated = false;

    render(
      <RequireAuth>
        <TestComponent />
      </RequireAuth>
    );

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});

describe('GuestOnly wrapper', () => {
  it('allows only unauthenticated users', () => {
    mockAuthContext.isAuthenticated = true;

    render(
      <GuestOnly>
        <TestComponent />
      </GuestOnly>
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders content for unauthenticated users', () => {
    mockAuthContext.isAuthenticated = false;

    render(
      <GuestOnly>
        <TestComponent />
      </GuestOnly>
    );

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });
});