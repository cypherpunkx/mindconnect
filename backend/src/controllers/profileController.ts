import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { validateUsername, validatePassword } from '../utils/auth';
import { 
  UpdateProfileRequest, 
  UpdatePasswordRequest,
  UploadProfilePictureResponse 
} from '../types/auth';
import { AuthUtils } from '../utils/auth';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Extend Request interface to include file and user properties
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
  file?: Express.Multer.File;
}

export class ProfileController {
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const { username, dateOfBirth, preferences }: UpdateProfileRequest = req.body;

      // Validate username if provided
      if (username !== undefined) {
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
          res.status(400).json({
            error: {
              code: 'INVALID_USERNAME',
              message: 'Username validation failed',
              details: usernameValidation.errors,
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
          return;
        }

        // Check username availability
        const isAvailable = await UserModel.checkUsernameAvailability(username, req.user.userId);
        if (!isAvailable) {
          res.status(409).json({
            error: {
              code: 'USERNAME_EXISTS',
              message: 'This username is already taken',
              timestamp: new Date().toISOString(),
              requestId: req.headers['x-request-id'] || 'unknown'
            }
          });
          return;
        }
      }

      // Prepare update data
      const updateData: any = {};
      
      if (username !== undefined) {
        updateData.username = username;
      }
      
      if (dateOfBirth !== undefined) {
        updateData.dateOfBirth = new Date(dateOfBirth);
      }
      
      if (preferences !== undefined) {
        updateData.preferences = preferences;
      }

      // Update profile
      const updated = await UserModel.updateProfile(req.user.userId, updateData);
      
      if (!updated) {
        res.status(500).json({
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update profile',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Get updated user data
      const updatedUser = await UserModel.findById(req.user.userId);
      
      res.json({
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: {
          code: 'PROFILE_UPDATE_FAILED',
          message: 'Failed to update profile',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const { currentPassword, newPassword }: UpdatePasswordRequest = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Current password and new password are required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Get user data
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Verify current password
      const currentPasswordHash = await UserModel.getPasswordHash(user.email);
      if (!currentPasswordHash) {
        res.status(500).json({
          error: {
            code: 'PASSWORD_VERIFICATION_FAILED',
            message: 'Failed to verify current password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, currentPasswordHash);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          error: {
            code: 'INVALID_NEW_PASSWORD',
            message: 'New password validation failed',
            details: passwordValidation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Hash new password and update
      const newPasswordHash = await AuthUtils.hashPassword(newPassword);
      const updated = await UserModel.updatePassword(user.email, newPasswordHash);

      if (!updated) {
        res.status(500).json({
          error: {
            code: 'PASSWORD_UPDATE_FAILED',
            message: 'Failed to update password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      res.json({
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        error: {
          code: 'PASSWORD_UPDATE_FAILED',
          message: 'Failed to update password',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async uploadProfilePicture(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'No profile picture file uploaded',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `profile_${req.user.userId}_${Date.now()}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'uploads', 'profiles');
      const filePath = path.join(uploadPath, fileName);

      // Ensure upload directory exists
      await fs.mkdir(uploadPath, { recursive: true });

      // Move file to permanent location
      await fs.writeFile(filePath, req.file.buffer);

      // Generate URL for the uploaded file
      const profilePictureUrl = `/uploads/profiles/${fileName}`;

      // Update user profile picture in database
      const updated = await UserModel.updateProfilePicture(req.user.userId, profilePictureUrl);

      if (!updated) {
        // Clean up uploaded file if database update fails
        await fs.unlink(filePath).catch(console.error);
        
        res.status(500).json({
          error: {
            code: 'PROFILE_PICTURE_UPDATE_FAILED',
            message: 'Failed to update profile picture',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const response: UploadProfilePictureResponse = {
        profilePictureUrl
      };

      res.json({
        message: 'Profile picture uploaded successfully',
        data: response
      });

    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        error: {
          code: 'PROFILE_PICTURE_UPLOAD_FAILED',
          message: 'Failed to upload profile picture',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async deleteProfilePicture(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Get current user data
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Delete profile picture from database
      const updated = await UserModel.updateProfilePicture(req.user.userId, '');

      if (!updated) {
        res.status(500).json({
          error: {
            code: 'PROFILE_PICTURE_DELETE_FAILED',
            message: 'Failed to delete profile picture',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Delete physical file if it exists
      if (user.profilePicture) {
        const filePath = path.join(process.cwd(), user.profilePicture);
        await fs.unlink(filePath).catch(console.error);
      }

      res.json({
        message: 'Profile picture deleted successfully'
      });

    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({
        error: {
          code: 'PROFILE_PICTURE_DELETE_FAILED',
          message: 'Failed to delete profile picture',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
}

// Multer configuration for profile picture uploads
export const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});