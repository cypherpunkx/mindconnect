import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock the auth API
const mockAuthApi = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  refreshToken: jest.fn(),
};

jest.mock('@/lib/api', () => ({
  authApi: mockAuthApi,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component that uses the auth context
const TestComponent = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({ 
        email: 'test@example.com', 
        username: 'testuser', 
        password: 'password', 
        confirmPassword: 'password',
        dateOfBirth: '2000-01-01',
        agreeToTerms: true
      })}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => forgotPassword({ email: 'test@example.com' })}>
        Forgot Password
      </button>
      <button onClick={() => resetPassword('token', 'newpassword')}>
        Reset Password
      </button>
      <button onClick={() => verifyEmail('token')}>
        Verify Email
      </button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('provides initial state', () => {
    renderWithAuthProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('checks auth status on mount when token exists', async () => {
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    mockAuthApi.refreshToken.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          isVerified: true,
        },
        token: 'new-token',
      },
    });

    renderWithAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockAuthApi.refreshToken).toHaveBeenCalled();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
  });

  it('removes token when refresh fails', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token');
    mockAuthApi.refreshToken.mockResolvedValue({
      success: false,
      error: 'Invalid token',
    });

    renderWithAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  describe('login', () => {
    it('handles successful login', async () => {
      mockAuthApi.login.mockResolvedValue({
        success: true,
        data: {
          token: 'auth-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            isVerified: true,
          },
        },
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      expect(mockAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token');
    });

    it('handles login failure', async () => {
      mockAuthApi.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('handles successful registration', async () => {
      mockAuthApi.register.mockResolvedValue({
        success: true,
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(mockAuthApi.register).toHaveBeenCalledWith({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password',
          dateOfBirth: '2000-01-01',
        });
      });
    });

    it('handles registration failure', async () => {
      mockAuthApi.register.mockResolvedValue({
        success: false,
        error: 'Email already exists',
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Register'));

      await waitFor(() => {
        expect(mockAuthApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('clears user state and token', async () => {
      // First login
      mockAuthApi.login.mockResolvedValue({
        success: true,
        data: {
          token: 'auth-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            isVerified: true,
          },
        },
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Then logout
      mockAuthApi.logout.mockResolvedValue({ success: true });

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('clears state even if API call fails', async () => {
      // First login
      mockAuthApi.login.mockResolvedValue({
        success: true,
        data: {
          token: 'auth-token',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            isVerified: true,
          },
        },
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Logout with API failure
      mockAuthApi.logout.mockRejectedValue(new Error('Network error'));

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('forgotPassword', () => {
    it('handles successful forgot password request', async () => {
      mockAuthApi.forgotPassword.mockResolvedValue({
        success: true,
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Forgot Password'));

      await waitFor(() => {
        expect(mockAuthApi.forgotPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('resetPassword', () => {
    it('handles successful password reset', async () => {
      mockAuthApi.resetPassword.mockResolvedValue({
        success: true,
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Reset Password'));

      await waitFor(() => {
        expect(mockAuthApi.resetPassword).toHaveBeenCalledWith('token', 'newpassword');
      });
    });
  });

  describe('verifyEmail', () => {
    it('handles successful email verification', async () => {
      mockAuthApi.verifyEmail.mockResolvedValue({
        success: true,
      });

      // Mock refreshAuth
      mockAuthApi.refreshToken.mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            isVerified: true,
          },
        },
      });

      renderWithAuthProvider();

      fireEvent.click(screen.getByText('Verify Email'));

      await waitFor(() => {
        expect(mockAuthApi.verifyEmail).toHaveBeenCalledWith('token');
      });
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});