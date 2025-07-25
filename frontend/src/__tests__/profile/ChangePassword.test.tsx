import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ChangePassword from '@/components/profile/ChangePassword';
import { userApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  userApi: {
    changePassword: jest.fn(),
  },
}));

const mockUserApi = userApi as jest.Mocked<typeof userApi>;

describe('ChangePassword', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockUserApi.changePassword.mockResolvedValue({
      success: true,
      message: 'Password changed successfully',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders change password form correctly', () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    const currentPasswordInput = screen.getByLabelText('Current Password');
    const toggleButton = currentPasswordInput.parentElement?.querySelector('button');
    
    // Initially password type
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide
      fireEvent.click(toggleButton);
      expect(currentPasswordInput).toHaveAttribute('type', 'password');
    }
  });

  it('validates required fields', async () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
    });
    
    expect(mockUserApi.changePassword).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with short new password
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'short' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'short' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByText('New password must be at least 8 characters long')).toBeInTheDocument();
    });
    
    expect(mockUserApi.changePassword).not.toHaveBeenCalled();
  });

  it('validates password confirmation match', async () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with mismatched passwords
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'differentpassword123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });
    
    expect(mockUserApi.changePassword).not.toHaveBeenCalled();
  });

  it('validates that new password is different from current', async () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with same password
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'samepassword123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'samepassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'samepassword123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByText('New password must be different from current password')).toBeInTheDocument();
    });
    
    expect(mockUserApi.changePassword).not.toHaveBeenCalled();
  });

  it('successfully changes password', async () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(mockUserApi.changePassword).toHaveBeenCalledWith('currentpass123', 'newpassword123');
    });
    
    expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalled();
    
    // Form should be cleared
    expect(screen.getByLabelText('Current Password')).toHaveValue('');
    expect(screen.getByLabelText('New Password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm New Password')).toHaveValue('');
  });

  it('handles password change errors', async () => {
    mockUserApi.changePassword.mockResolvedValue({
      success: false,
      error: 'Current password is incorrect',
    });

    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
    });
    
    expect(mockOnError).toHaveBeenCalledWith('Current password is incorrect');
  });

  it('shows loading state during password change', async () => {
    // Mock a delayed response
    mockUserApi.changePassword.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'currentpass123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    // Check loading state
    expect(screen.getByText('Changing Password...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });
  });

  it('clears error messages when user types', () => {
    render(<ChangePassword onSuccess={mockOnSuccess} onError={mockOnError} />);
    
    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    
    // Error should be visible
    expect(screen.getByText('Current password is required')).toBeInTheDocument();
    
    // Start typing in current password field
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'a' }
    });
    
    // Error should be cleared
    expect(screen.queryByText('Current password is required')).not.toBeInTheDocument();
  });
});