import { testConnection, initializeDatabase, pool } from '../config/database';

describe('Database Configuration', () => {
  beforeAll(async () => {
    // Wait a bit for database to be ready in CI
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Connection', () => {
    it('should connect to database successfully', async () => {
      const isConnected = await testConnection();
      expect(isConnected).toBe(true);
    });
  });

  describe('Table Initialization', () => {
    it('should initialize database tables without errors', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should create users table', async () => {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users'
      `);
      
      connection.release();
      expect((rows as any)[0].count).toBe(1);
    });

    it('should create assessment_results table', async () => {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'assessment_results'
      `);
      
      connection.release();
      expect((rows as any)[0].count).toBe(1);
    });

    it('should create journal_entries table', async () => {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'journal_entries'
      `);
      
      connection.release();
      expect((rows as any)[0].count).toBe(1);
    });
  });

  describe('Database Pool', () => {
    it('should have proper pool configuration', () => {
      // Test that pool is properly configured
      expect(pool).toBeDefined();
      expect(typeof pool.getConnection).toBe('function');
    });
  });
});