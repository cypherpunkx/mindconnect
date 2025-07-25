import { pool } from '../config/database';
import { User, UserPreferences } from '../types/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UserModel {
  static async create(userData: {
    email: string;
    username: string;
    passwordHash: string;
    dateOfBirth?: Date;
    preferences?: UserPreferences;
  }): Promise<string> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO users (email, username, password_hash, date_of_birth, preferences) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userData.email,
          userData.username,
          userData.passwordHash,
          userData.dateOfBirth || null,
          userData.preferences ? JSON.stringify(userData.preferences) : null
        ]
      );
      
      // Get the created user ID
      const [userRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );
      
      return userRows[0].id;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, username, date_of_birth, created_at, last_active, 
                is_verified, preferences, profile_picture 
         FROM users WHERE email = ?`,
        [email]
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        dateOfBirth: row.date_of_birth,
        createdAt: row.created_at,
        lastActive: row.last_active,
        isVerified: row.is_verified,
        preferences: row.preferences ? JSON.parse(row.preferences) : undefined,
        profilePicture: row.profile_picture
      };
    } finally {
      connection.release();
    }
  }

  static async findByUsername(username: string): Promise<User | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, username, date_of_birth, created_at, last_active, 
                is_verified, preferences, profile_picture 
         FROM users WHERE username = ?`,
        [username]
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        dateOfBirth: row.date_of_birth,
        createdAt: row.created_at,
        lastActive: row.last_active,
        isVerified: row.is_verified,
        preferences: row.preferences ? JSON.parse(row.preferences) : undefined,
        profilePicture: row.profile_picture
      };
    } finally {
      connection.release();
    }
  }

  static async findById(id: string): Promise<User | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT id, email, username, date_of_birth, created_at, last_active, 
                is_verified, preferences, profile_picture 
         FROM users WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        dateOfBirth: row.date_of_birth,
        createdAt: row.created_at,
        lastActive: row.last_active,
        isVerified: row.is_verified,
        preferences: row.preferences ? JSON.parse(row.preferences) : undefined,
        profilePicture: row.profile_picture
      };
    } finally {
      connection.release();
    }
  }

  static async getPasswordHash(email: string): Promise<string | null> {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT password_hash FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0].password_hash : null;
    } finally {
      connection.release();
    }
  }

  static async updateLastActive(userId: string): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.execute(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } finally {
      connection.release();
    }
  }

  static async updatePassword(email: string, passwordHash: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, email]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async verifyUser(email: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE users SET is_verified = TRUE WHERE email = ?',
        [email]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updatePreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE users SET preferences = ? WHERE id = ?',
        [JSON.stringify(preferences), userId]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updateProfile(userId: string, profileData: {
    username?: string;
    dateOfBirth?: Date;
    preferences?: UserPreferences;
  }): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (profileData.username !== undefined) {
        updates.push('username = ?');
        values.push(profileData.username);
      }
      
      if (profileData.dateOfBirth !== undefined) {
        updates.push('date_of_birth = ?');
        values.push(profileData.dateOfBirth);
      }
      
      if (profileData.preferences !== undefined) {
        updates.push('preferences = ?');
        values.push(JSON.stringify(profileData.preferences));
      }
      
      if (updates.length === 0) {
        return false;
      }
      
      values.push(userId);
      
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updateProfilePicture(userId: string, profilePictureUrl: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePictureUrl, userId]
      );
      
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      let query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
      const params: any[] = [username];
      
      if (excludeUserId) {
        query += ' AND id != ?';
        params.push(excludeUserId);
      }
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      
      return rows[0].count === 0;
    } finally {
      connection.release();
    }
  }
}