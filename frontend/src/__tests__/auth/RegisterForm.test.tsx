import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { RegisterForm } from '@/components/auth/RegisterForm';

// Mock the auth API
jest.mock('@/lib/api', () => ({
  authApi: {
    register: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockRegister = jest.fn();

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="mock-auth-provider">
      {children}
    </div>
  );
};

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    refreshAuth: jest.fn(),
  }),
}));

const renderRegisterForm = (props = {}) => {
  return render(
    <MockAuthProvider>
      <RegisterForm {...props} />
    </MockAuthProvider>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form with all required fields', () => {
    renderRegisterForm();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /i agree to the/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty required fields', async () => {
    renderRegisterForm();

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderRegisterForm();

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates username requirements', async () => {
    renderRegisterForm();

    const usernameInput = screen.getByLabelText(/username/i);
    
    // Test minimum length
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });

    // Test invalid characters
    fireEvent.change(usernameInput, { target: { value: 'user@name' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
    });
  });

  it('validates password strength requirements', async () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    
    // Test minimum length
    fireEvent.change(passwordInput, { target: { value: '1234567' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Test complexity requirements
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter, one lowercase letter, and one number/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', async () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });

    await waitFor(() => {
      expect(screen.getByText(/good/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });
    fireEvent.blur(confirmPasswordInput);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('validates age requirements', async () => {
    renderRegisterForm();

    const dateInput = screen.getByLabelText(/date of birth/i);
    
    // Test too young (under 13)
    const tooYoung = new Date();
    tooYoung.setFullYear(tooYoung.getFullYear() - 10);
    fireEvent.change(dateInput, { target: { value: tooYoung.toISOString().split('T')[0] } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(screen.getByText(/you must be between 13 and 25 years old/i)).toBeInTheDocument();
    });

    // Test too old (over 25)
    const tooOld = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - 30);
    fireEvent.change(dateInput, { target: { value: tooOld.toISOString().split('T')[0] } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(screen.getByText(/you must be between 13 and 25 years old/i)).toBeInTheDocument();
    });
  });

  it('requires terms agreement', async () => {
    renderRegisterForm();

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/you must agree to the terms and conditions/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderRegisterForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
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

  it('enables submit button when form is valid', async () => {
    renderRegisterForm();

    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    const dateInput = screen.getByLabelText(/date of birth/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });

    expect(submitButton).toBeDisabled();

    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 18);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(dateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(termsCheckbox);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows success message after successful registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ success: true });

    renderRegisterForm();

    // Fill out valid form
    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    const dateInput = screen.getByLabelText(/date of birth/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 18);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(dateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration successful!/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification email/i)).toBeInTheDocument();
    });
  });

  it('displays error message on registration failure', async () => {
    const mockRegister = jest.fn().mockResolvedValue({
      success: false,
      error: 'Email already exists'
    });

    renderRegisterForm();

    // Fill out valid form and submit
    const emailInput = screen.getByLabelText(/email address/i);
    const usernameInput = screen.getByLabelText(/username/i);
    const dateInput = screen.getByLabelText(/date of birth/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });

    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 18);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(dateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(termsCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('renders login link', () => {
    renderRegisterForm();

    const loginLink = screen.getByRole('link', { name: /sign in here/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });
});