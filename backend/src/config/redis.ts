import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
};

// Create Redis client
export const redisClient = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
  database: redisConfig.db,
});

// Redis connection event handlers
redisClient.on('connect', () => {
  console.log('🔗 Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis connection ready');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redisClient.on('end', () => {
  console.log('🔌 Redis connection ended');
});

// Initialize Redis connection
export const initializeRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    
    // Test Redis connection
    await redisClient.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
};

// Session management utilities
export const sessionUtils = {
  // Set session data
  setSession: async (sessionId: string, data: any, ttl: number = 3600): Promise<void> => {
    try {
      await redisClient.setEx(`session:${sessionId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  },

  // Get session data
  getSession: async (sessionId: string): Promise<any | null> => {
    try {
      const data = await redisClient.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await redisClient.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Set cache data
  setCache: async (key: string, data: any, ttl: number = 300): Promise<void> => {
    try {
      await redisClient.setEx(`cache:${key}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting cache:', error);
      throw error;
    }
  },

  // Get cache data
  getCache: async (key: string): Promise<any | null> => {
    try {
      const data = await redisClient.get(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  // Delete cache
  deleteCache: async (key: string): Promise<void> => {
    try {
      await redisClient.del(`cache:${key}`);
    } catch (error) {
      console.error('Error deleting cache:', error);
      throw error;
    }
  }
};

export default redisClient;