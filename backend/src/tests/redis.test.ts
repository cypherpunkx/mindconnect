import { initializeRedis, sessionUtils, redisClient } from '../config/redis';

describe('Redis Configuration', () => {
  beforeAll(async () => {
    // Wait a bit for Redis to be ready in CI
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initializeRedis();
  });

  afterAll(async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  describe('Connection', () => {
    it('should connect to Redis successfully', async () => {
      const isConnected = await initializeRedis();
      expect(isConnected).toBe(true);
    });

    it('should respond to ping', async () => {
      const response = await redisClient.ping();
      expect(response).toBe('PONG');
    });
  });

  describe('Session Management', () => {
    const testSessionId = 'test-session-123';
    const testData = { userId: '123', username: 'testuser' };

    afterEach(async () => {
      // Clean up test data
      await sessionUtils.deleteSession(testSessionId);
    });

    it('should set and get session data', async () => {
      await sessionUtils.setSession(testSessionId, testData, 60);
      const retrievedData = await sessionUtils.getSession(testSessionId);
      
      expect(retrievedData).toEqual(testData);
    });

    it('should return null for non-existent session', async () => {
      const retrievedData = await sessionUtils.getSession('non-existent-session');
      expect(retrievedData).toBeNull();
    });

    it('should delete session data', async () => {
      await sessionUtils.setSession(testSessionId, testData, 60);
      await sessionUtils.deleteSession(testSessionId);
      
      const retrievedData = await sessionUtils.getSession(testSessionId);
      expect(retrievedData).toBeNull();
    });
  });

  describe('Cache Management', () => {
    const testCacheKey = 'test-cache-key';
    const testCacheData = { message: 'cached data' };

    afterEach(async () => {
      // Clean up test data
      await sessionUtils.deleteCache(testCacheKey);
    });

    it('should set and get cache data', async () => {
      await sessionUtils.setCache(testCacheKey, testCacheData, 60);
      const retrievedData = await sessionUtils.getCache(testCacheKey);
      
      expect(retrievedData).toEqual(testCacheData);
    });

    it('should return null for non-existent cache', async () => {
      const retrievedData = await sessionUtils.getCache('non-existent-cache');
      expect(retrievedData).toBeNull();
    });

    it('should delete cache data', async () => {
      await sessionUtils.setCache(testCacheKey, testCacheData, 60);
      await sessionUtils.deleteCache(testCacheKey);
      
      const retrievedData = await sessionUtils.getCache(testCacheKey);
      expect(retrievedData).toBeNull();
    });
  });
});