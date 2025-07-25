import { testConnection } from '../config/database';
import { initializeRedis, redisClient } from '../config/redis';

describe('Infrastructure Setup', () => {
  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.NODE_ENV).toBeDefined();
      expect(process.env.DB_HOST).toBeDefined();
      expect(process.env.DB_PORT).toBeDefined();
      expect(process.env.REDIS_HOST).toBeDefined();
      expect(process.env.REDIS_PORT).toBeDefined();
    });
  });

  describe('Database Configuration', () => {
    it('should have database configuration object', () => {
      // Test that database config is properly set up
      expect(typeof testConnection).toBe('function');
    });
  });

  describe('Redis Configuration', () => {
    it('should have Redis configuration object', () => {
      // Test that Redis config is properly set up
      expect(typeof initializeRedis).toBe('function');
      expect(redisClient).toBeDefined();
    });
  });

  describe('TypeScript Configuration', () => {
    it('should compile TypeScript without errors', () => {
      // This test passes if the file compiles successfully
      expect(true).toBe(true);
    });
  });

  describe('Package Dependencies', () => {
    it('should have all required dependencies available', () => {
      // Test that key dependencies are available
      expect(() => require('express')).not.toThrow();
      expect(() => require('mysql2/promise')).not.toThrow();
      expect(() => require('redis')).not.toThrow();
      expect(() => require('socket.io')).not.toThrow();
      expect(() => require('cors')).not.toThrow();
      expect(() => require('helmet')).not.toThrow();
      expect(() => require('morgan')).not.toThrow();
      expect(() => require('dotenv')).not.toThrow();
      expect(() => require('bcryptjs')).not.toThrow();
      expect(() => require('jsonwebtoken')).not.toThrow();
    });
  });
});