import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../index';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';

// Mock dependencies
jest.mock('../models/User');
jest.mock('../utils/auth');
jest.mock('../config/database');
jest.mock('../config/redis');

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockAuthUtils = AuthUtils as jest.Mocked<typeof AuthUtils>;

describe('Profile Controller', () => {
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
        frequency: 'daily' as const
      },
      privacy: {
        profileVisibility: 'private' as const,
        dataSharing: false,
        analyticsOptOut: false
      },
      accessibility: {
        fontSize: 'medium' as const,
        highContrast: false,
        textToSpeech: false,
        keyboardNavigation: false
      }
    }
  };

  const mockToken = 'valid-jwt-token';

  beforeEach(() => {
    // Mock JWT verification to return user data
    jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue({
      userId: mockUser.id,
      email: mockUser.email,
      username: mockUser.username
    });

    mockUserModel.findById.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/v1/profile/update', () => {
    it('should update profile successfully', async () => {
      mockUserModel.checkUsernameAvailability.mockResolvedValue(true);
      mockUserModel.updateProfile.mockResolvedValue(true);

      const updateData = {
        username: 'newusername',
        dateOfBirth: '1995-05-15'
      };

      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(mockUserModel.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          username: 'newusername',
          dateOfBirth: new Date('1995-05-15')
        })
      );
    });

    it('should return error for duplicate username', async () => {
      mockUserModel.checkUsernameAvailability.mockResolvedValue(false);

      const updateData = {
        username: 'existinguser'
      };

      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('USERNAME_EXISTS');
    });

    it('should return error for invalid username', async () => {
      const updateData = {
        username: 'a' // Too short
      };

      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_USERNAME');
    });

    it('should update preferences successfully', async () => {
      mockUserModel.updateProfile.mockResolvedValue(true);

      const updateData = {
        preferences: {
          notifications: {
            email: false,
            push: true,
            sms: false,
            frequency: 'weekly'
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: true,
            analyticsOptOut: false
          },
          accessibility: {
            fontSize: 'large',
            highContrast: true,
            textToSpeech: false,
            keyboardNavigation: true
          }
        }
      };

      const response = await request(app)
        .put('/api/v1/profile/update')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(mockUserModel.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: updateData.preferences
        })
      );
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/v1/profile/update')
        .send({ username: 'newusername' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/profile/password', () => {
    it('should update password successfully', async () => {
      mockUserModel.getPasswordHash.mockResolvedValue('hashed-current-password');
      mockAuthUtils.comparePassword.mockResolvedValue(true);
      mockAuthUtils.hashPassword.mockResolvedValue('hashed-new-password');
      mockUserModel.updatePassword.mockResolvedValue(true);

      const passwordData = {
        currentPassword: 'currentpass123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password updated successfully');
      expect(mockAuthUtils.comparePassword).toHaveBeenCalledWith(
        'currentpass123',
        'hashed-current-password'
      );
      expect(mockUserModel.updatePassword).toHaveBeenCalledWith(
        mockUser.email,
        'hashed-new-password'
      );
    });

    it('should return error for incorrect current password', async () => {
      mockUserModel.getPasswordHash.mockResolvedValue('hashed-current-password');
      mockAuthUtils.comparePassword.mockResolvedValue(false);

      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should validate new password', async () => {
      const passwordData = {
        currentPassword: 'currentpass123',
        newPassword: 'short' // Too short
      };

      const response = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_NEW_PASSWORD');
    });

    it('should require both current and new password', async () => {
      const response = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ currentPassword: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });

  describe('POST /api/v1/profile/picture', () => {
    it('should upload profile picture successfully', async () => {
      mockUserModel.updateProfilePicture.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/profile/picture')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('profilePicture', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile picture uploaded successfully');
      expect(response.body.data.profilePictureUrl).toMatch(/^\/uploads\/profiles\//);
    });

    it('should return error when no file is uploaded', async () => {
      const response = await request(app)
        .post('/api/v1/profile/picture')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_FILE_UPLOADED');
    });

    it('should validate file type', async () => {
      const response = await request(app)
        .post('/api/v1/profile/picture')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('profilePicture', Buffer.from('fake-file-data'), 'test.txt');

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/profile/picture', () => {
    it('should delete profile picture successfully', async () => {
      mockUserModel.updateProfilePicture.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/v1/profile/picture')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile picture deleted successfully');
      expect(mockUserModel.updateProfilePicture).toHaveBeenCalledWith(mockUser.id, '');
    });

    it('should handle user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/profile/picture')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});