import { ProfileController } from '../controllers/profileController';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../models/User');
jest.mock('../utils/auth');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockAuthUtils = AuthUtils as jest.Mocked<typeof AuthUtils>;

describe('Profile Controller Integration', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    dateOfBirth: new Date('1990-01-01'),
    isVerified: true,
    createdAt: new Date(),
    preferences: {
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

  const mockRequest = {
    user: {
      userId: mockUser.id,
      email: mockUser.email,
      username: mockUser.username
    },
    body: {},
    headers: {}
  } as any;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserModel.findById.mockResolvedValue(mockUser);
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockUserModel.checkUsernameAvailability.mockResolvedValue(true);
      mockUserModel.updateProfile.mockResolvedValue(true);

      mockRequest.body = {
        username: 'newusername',
        dateOfBirth: '1995-05-15'
      };

      await ProfileController.updateProfile(mockRequest, mockResponse);

      expect(mockUserModel.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          username: 'newusername',
          dateOfBirth: new Date('1995-05-15')
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        data: mockUser
      });
    });

    it('should handle username availability check', async () => {
      mockUserModel.checkUsernameAvailability.mockResolvedValue(false);

      mockRequest.body = {
        username: 'existinguser'
      };

      await ProfileController.updateProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'USERNAME_EXISTS'
          })
        })
      );
    });

    it('should update preferences successfully', async () => {
      mockUserModel.updateProfile.mockResolvedValue(true);

      const newPreferences = {
        notifications: {
          email: false,
          push: true,
          sms: false,
          frequency: 'weekly' as const,
          types: {
            assessment: true,
            community: false,
            educational: true,
            reminders: false,
          }
        },
        privacy: {
          profileVisibility: 'public' as const,
          dataSharing: true,
          analyticsOptOut: false,
          communityParticipation: true,
        },
        accessibility: {
          fontSize: 'large' as const,
          highContrast: true,
          textToSpeech: false,
          keyboardNavigation: true,
          reducedMotion: false,
        }
      };

      mockRequest.body = {
        preferences: newPreferences
      };

      await ProfileController.updateProfile(mockRequest, mockResponse);

      expect(mockUserModel.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: newPreferences
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        data: mockUser
      });
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockUserModel.getPasswordHash.mockResolvedValue('hashed-current-password');
      mockAuthUtils.comparePassword.mockResolvedValue(true);
      mockAuthUtils.hashPassword.mockResolvedValue('hashed-new-password');
      mockUserModel.updatePassword.mockResolvedValue(true);

      mockRequest.body = {
        currentPassword: 'currentpass123',
        newPassword: 'newpassword123'
      };

      await ProfileController.updatePassword(mockRequest, mockResponse);

      expect(mockAuthUtils.comparePassword).toHaveBeenCalledWith(
        'currentpass123',
        'hashed-current-password'
      );
      expect(mockUserModel.updatePassword).toHaveBeenCalledWith(
        mockUser.email,
        'hashed-new-password'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password updated successfully'
      });
    });

    it('should reject incorrect current password', async () => {
      mockUserModel.getPasswordHash.mockResolvedValue('hashed-current-password');
      mockAuthUtils.comparePassword.mockResolvedValue(false);

      mockRequest.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      await ProfileController.updatePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_CURRENT_PASSWORD'
          })
        })
      );
    });

    it('should require both passwords', async () => {
      mockRequest.body = {
        currentPassword: 'test'
        // Missing newPassword
      };

      await ProfileController.updatePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'MISSING_FIELDS'
          })
        })
      );
    });
  });

  describe('deleteProfilePicture', () => {
    it('should delete profile picture successfully', async () => {
      mockUserModel.updateProfilePicture.mockResolvedValue(true);

      await ProfileController.deleteProfilePicture(mockRequest, mockResponse);

      expect(mockUserModel.updateProfilePicture).toHaveBeenCalledWith(mockUser.id, '');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Profile picture deleted successfully'
      });
    });

    it('should handle user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await ProfileController.deleteProfilePicture(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'USER_NOT_FOUND'
          })
        })
      );
    });
  });

  describe('authentication requirements', () => {
    it('should require authentication for all endpoints', async () => {
      const unauthenticatedRequest = {
        user: undefined,
        body: {},
        headers: {}
      } as any;

      await ProfileController.updateProfile(unauthenticatedRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(401);

      await ProfileController.updatePassword(unauthenticatedRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(401);

      await ProfileController.deleteProfilePicture(unauthenticatedRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});