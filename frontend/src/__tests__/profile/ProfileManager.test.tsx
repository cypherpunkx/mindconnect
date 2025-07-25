import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ProfileManager from '@/components/profile/ProfileManager';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';

// Mock the dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/lib/api', () => ({
  userApi: {
    updateProfile: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUserApi = userApi as jest.Mocked<typeof userApi>;

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  dateOfBirth: new Date('1990-01-01'),
  isVerified: true,
  createdAt: new Date(),
  preferences: {
    theme: 'system' as const,
    notifications: {
      email: true,
      push: true,
      sms: false,
      frequency: 'daily' as const,
      types: {
        assessment: true,
        community: true,
        educational: true,
        reminders: true,
      }
    },
    privacy: {
      profileVisibility: 'private' as const,
      dataSharing: false,
      analyticsOptOut: false,
      communityParticipation: true,
    },
    accessibility: {
      fontSize: 'medium' as const,
      highContrast: false,
      textToSpeech: false,
      keyboardNavigation: false,
      reducedMotion: false,
    }
  }
};

describe('ProfileManager', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateUser: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    mockUserApi.updateProfile.mockResolvedValue({
      success: true,
      data: mockUser,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile information correctly', () => {
    render(<ProfileManager />);
    
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('switches between profile and settings tabs', () => {
    render(<ProfileManager />);
    
    // Initially on profile tab
    expect(screen.getByText('Profile Information')).toHaveClass('text-blue-600');
    
    // Switch to settings tab
    fireEvent.click(screen.getByText('Settings & Preferences'));
    expect(screen.getByText('Settings & Preferences')).toHaveClass('text-blue-600');
  });

  it('updates profile information successfully', async () => {
    const mockUpdateUser = jest.fn();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<ProfileManager />);
    
    // Change username
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockUserApi.updateProfile).toHaveBeenCalledWith({
        username: 'newusername'
      });
    });
    
    expect(mockUpdateUser).toHaveBeenCalledWith(mockUser);
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });

  it('handles profile update errors', async () => {
    mockUserApi.updateProfile.mockResolvedValue({
      success: false,
      error: 'Username already exists',
    });

    render(<ProfileManager />);
    
    // Change username
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('shows loading state during profile update', async () => {
    // Mock a delayed response
    mockUserApi.updateProfile.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockUser }), 100))
    );

    render(<ProfileManager />);
    
    // Change username
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('updates user preferences successfully', async () => {
    const mockUpdateUser = jest.fn();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<ProfileManager />);
    
    // Switch to settings tab
    fireEvent.click(screen.getByText('Settings & Preferences'));
    
    // Change theme to dark
    fireEvent.click(screen.getByText('dark'));
    
    // Submit settings
    fireEvent.click(screen.getByText('Save Settings'));
    
    await waitFor(() => {
      expect(mockUserApi.updateProfile).toHaveBeenCalledWith({
        preferences: expect.objectContaining({
          theme: 'dark'
        })
      });
    });
  });

  it('shows no changes message when no fields are modified', async () => {
    render(<ProfileManager />);
    
    // Submit form without changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(screen.getByText('No changes to save')).toBeInTheDocument();
    });
    
    expect(mockUserApi.updateProfile).not.toHaveBeenCalled();
  });

  it('renders loading state when user is not available', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      updateUser: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<ProfileManager />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('handles date of birth changes correctly', async () => {
    render(<ProfileManager />);
    
    // Change date of birth
    const dobInput = screen.getByLabelText('Date of Birth');
    fireEvent.change(dobInput, { target: { value: '1995-05-15' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockUserApi.updateProfile).toHaveBeenCalledWith({
        dateOfBirth: '1995-05-15'
      });
    });
  });
});