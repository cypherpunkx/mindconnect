import request from 'supertest';
import app from '../index';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';
import { pool } from '../config/database';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE email LIKE "%test%"');
    connection.release();
  });

  afterAll(async () => {
    // Clean up test data after running tests
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE email LIKE "%test%"');
    connection.release();
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPassword123!',
        dateOfBirth: '2000-01-01'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.isVerified).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser2',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_EMAIL');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_PASSWORD');
      expect(response.body.error.details).toBeInstanceOf(Array);
    });

    it('should reject registration with invalid username', async () => {
      const userData = {
        email: 'test3@example.com',
        username: 'ab',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_USERNAME');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'test@example.com', // Same as first test
        username: 'testuser3',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should reject registration with duplicate username', async () => {
      const userData = {
        email: 'test4@example.com',
        username: 'testuser', // Same as first test
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('USERNAME_EXISTS');
    });

    it('should reject registration with missing fields', async () => {
      const userData = {
        email: 'test5@example.com'
        // Missing username and password
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toContain('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/request-password-reset', () => {
    it('should accept password reset request for existing user', async () => {
      const resetData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toContain('password reset link has been sent');
    });

    it('should accept password reset request for non-existing user (security)', async () => {
      const resetData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toContain('password reset link has been sent');
    });

    it('should reject password reset request with invalid email', async () => {
      const resetData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send(resetData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_EMAIL');
    });

    it('should reject password reset request with missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/request-password-reset')
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_EMAIL');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken: string;

    beforeAll(() => {
      // Generate a valid reset token for testing
      resetToken = AuthUtils.generateResetToken('test@example.com');
    });

    it('should reset password successfully with valid token', async () => {
      const resetData = {
        token: resetToken,
        newPassword: 'NewTestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toContain('Password reset successfully');

      // Verify login with new password
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewTestPassword123!'
        })
        .expect(200);

      expect(loginResponse.body.data.token).toBeDefined();
    });

    it('should reject password reset with invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        newPassword: 'NewTestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject password reset with weak password', async () => {
      const newResetToken = AuthUtils.generateResetToken('test@example.com');
      const resetData = {
        token: newResetToken,
        newPassword: 'weak'
      };

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });

    it('should reject password reset with missing fields', async () => {
      const resetData = {
        token: resetToken
        // Missing newPassword
      };

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_FIELDS');
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    let verificationToken: string;

    beforeAll(() => {
      // Generate a valid verification token for testing
      verificationToken = AuthUtils.generateVerificationToken('test@example.com');
    });

    it('should verify email successfully with valid token', async () => {
      const verifyData = {
        token: verificationToken
      };

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send(verifyData)
        .expect(200);

      expect(response.body.message).toContain('Email verified successfully');
    });

    it('should reject email verification with invalid token', async () => {
      const verifyData = {
        token: 'invalid-token'
      };

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send(verifyData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject email verification with missing token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewTestPassword123!'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get user profile successfully with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.isVerified).toBe(true); // Should be verified after email verification test
    });

    it('should reject profile request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should reject profile request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });
});