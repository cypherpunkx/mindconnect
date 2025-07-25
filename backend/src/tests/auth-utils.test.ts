import { AuthUtils, validateEmail, validatePassword, validateUsername } from '../utils/auth';

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthUtils.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthUtils.hashPassword(password);
      
      const isValid = await AuthUtils.comparePassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await AuthUtils.comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser'
      };

      const token = AuthUtils.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify JWT token correctly', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser'
      };

      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        AuthUtils.verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('Reset Token Generation', () => {
    it('should generate valid reset token', () => {
      const email = 'test@example.com';
      const token = AuthUtils.generateResetToken(email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify reset token correctly', () => {
      const email = 'test@example.com';
      const token = AuthUtils.generateResetToken(email);
      const decoded = AuthUtils.verifyResetToken(token);

      expect(decoded.email).toBe(email);
    });

    it('should throw error for invalid reset token type', () => {
      const regularToken = AuthUtils.generateToken({
        userId: 'test',
        email: 'test@example.com',
        username: 'test'
      });

      expect(() => {
        AuthUtils.verifyResetToken(regularToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('Email Verification Token', () => {
    it('should generate valid verification token', () => {
      const email = 'test@example.com';
      const token = AuthUtils.generateVerificationToken(email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify email token correctly', () => {
      const email = 'test@example.com';
      const token = AuthUtils.generateVerificationToken(email);
      const decoded = AuthUtils.verifyEmailToken(token);

      expect(decoded.email).toBe(email);
    });

    it('should throw error for invalid email token type', () => {
      const resetToken = AuthUtils.generateResetToken('test@example.com');

      expect(() => {
        AuthUtils.verifyEmailToken(resetToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'TestPassword123!',
        'MyStr0ng@Pass',
        'C0mpl3x#Password',
        'Secure123$Pass'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        { password: 'short', expectedErrors: 4 }, // too short, no uppercase, no number, no special
        { password: 'toolongbutnouppercaseornumberorspecial', expectedErrors: 3 },
        { password: 'NoNumbers!', expectedErrors: 1 },
        { password: 'nonumbers123', expectedErrors: 2 }, // no uppercase, no special
        { password: 'NOLOWERCASE123!', expectedErrors: 1 }
      ];

      weakPasswords.forEach(({ password, expectedErrors }) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(expectedErrors);
      });
    });
  });

  describe('Username Validation', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'testuser',
        'user123',
        'test_user',
        'user-name',
        'User123',
        'test_user_123'
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        { username: 'ab', expectedErrors: 1 }, // too short
        { username: 'a'.repeat(31), expectedErrors: 1 }, // too long
        { username: 'user@name', expectedErrors: 1 }, // invalid character
        { username: 'user name', expectedErrors: 1 }, // space
        { username: 'user.name', expectedErrors: 1 }, // dot
        { username: '', expectedErrors: 2 } // empty and too short
      ];

      invalidUsernames.forEach(({ username, expectedErrors }) => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(expectedErrors);
      });
    });
  });
});