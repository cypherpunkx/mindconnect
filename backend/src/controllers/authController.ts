import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthUtils, validateEmail, validatePassword, validateUsername } from '../utils/auth';
import { EmailService } from '../services/emailService';
import { 
  RegisterRequest, 
  LoginRequest, 
  PasswordResetRequest, 
  PasswordResetConfirm,
  AuthResponse 
} from '../types/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, dateOfBirth }: RegisterRequest = req.body;

      // Validation
      if (!email || !username || !password) {
        res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, username, and password are required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        res.status(400).json({
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Validate username
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

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Password validation failed',
            details: passwordValidation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(email);
      if (existingUserByEmail) {
        res.status(409).json({
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const existingUserByUsername = await UserModel.findByUsername(username);
      if (existingUserByUsername) {
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

      // Hash password and create user
      const passwordHash = await AuthUtils.hashPassword(password);
      const userId = await UserModel.create({
        email,
        username,
        passwordHash,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      });

      // Generate verification token and send email
      const verificationToken = AuthUtils.generateVerificationToken(email);
      await EmailService.sendVerificationEmail(email, verificationToken);

      // Get created user (without password)
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      });

      const response: AuthResponse = {
        user,
        token
      };

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        data: response
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to register user',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email and password are required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Find user and verify password
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const passwordHash = await UserModel.getPasswordHash(email);
      if (!passwordHash) {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      const isValidPassword = await AuthUtils.comparePassword(password, passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      });

      // Update last active
      await UserModel.updateLastActive(user.id);

      const response: AuthResponse = {
        user,
        token
      };

      res.json({
        message: 'Login successful',
        data: response
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'LOGIN_FAILED',
          message: 'Failed to login',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email }: PasswordResetRequest = req.body;

      if (!email) {
        res.status(400).json({
          error: {
            code: 'MISSING_EMAIL',
            message: 'Email is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      if (!validateEmail(email)) {
        res.status(400).json({
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Check if user exists
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        res.json({
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
        return;
      }

      // Generate reset token and send email
      const resetToken = AuthUtils.generateResetToken(email);
      await EmailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        error: {
          code: 'RESET_REQUEST_FAILED',
          message: 'Failed to process password reset request',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword }: PasswordResetConfirm = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Token and new password are required',
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
            code: 'INVALID_PASSWORD',
            message: 'Password validation failed',
            details: passwordValidation.errors,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Verify reset token
      let email: string;
      try {
        const tokenData = AuthUtils.verifyResetToken(token);
        email = tokenData.email;
      } catch (error) {
        res.status(400).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Check if user exists
      const user = await UserModel.findByEmail(email);
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

      // Hash new password and update
      const passwordHash = await AuthUtils.hashPassword(newPassword);
      const updated = await UserModel.updatePassword(email, passwordHash);

      if (!updated) {
        res.status(500).json({
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update password',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      res.json({
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        error: {
          code: 'RESET_FAILED',
          message: 'Failed to reset password',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          error: {
            code: 'MISSING_TOKEN',
            message: 'Verification token is required',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Verify email token
      let email: string;
      try {
        const tokenData = AuthUtils.verifyEmailToken(token);
        email = tokenData.email;
      } catch (error) {
        res.status(400).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired verification token',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
        return;
      }

      // Verify user
      const verified = await UserModel.verifyUser(email);
      if (!verified) {
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

      res.json({
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Failed to verify email',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
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

      res.json({
        data: user
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: {
          code: 'PROFILE_FETCH_FAILED',
          message: 'Failed to fetch user profile',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
}