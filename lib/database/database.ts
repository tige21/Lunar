/**
 * Core SQLite database service for Lunar Sleep Analysis App
 * Handles database initialization, migrations, and connections
 */

import * as SQLite from 'expo-sqlite';
import { 
  DATABASE_VERSION, 
  DATABASE_NAME, 
  MIGRATIONS, 
  CREATE_TRIGGERS 
} from './schema';
import type { DatabaseResult } from './types';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection and run migrations
   */
  public async initialize(): Promise<DatabaseResult<void>> {
    if (this.isInitialized) {
      return { success: true };
    }

    if (this.initPromise) {
      await this.initPromise;
      return { success: this.isInitialized };
    }

    this.initPromise = this.performInitialization();
    await this.initPromise;
    
    return { 
      success: this.isInitialized,
      error: this.isInitialized ? undefined : 'Failed to initialize database'
    };
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('[DatabaseService] Initializing database...');
      
      // Open database connection
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      // Enable foreign key constraints
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Enable WAL mode for better performance
      await this.db.execAsync('PRAGMA journal_mode = WAL;');
      
      // Run migrations
      await this.runMigrations();
      
      // Create triggers
      await this.createTriggers();
      
      // Initialize default data
      await this.initializeDefaultData();
      
      this.isInitialized = true;
      console.log('[DatabaseService] Database initialized successfully');
      
    } catch (error) {
      console.error('[DatabaseService] Failed to initialize database:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  public async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return this.db;
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get current version
      let currentVersion = 0;
      try {
        const result = await this.db.getFirstAsync<{ user_version: number }>(
          'PRAGMA user_version;'
        );
        currentVersion = result?.user_version || 0;
      } catch (error) {
        console.log('[DatabaseService] No existing version found, starting fresh');
      }

      console.log(`[DatabaseService] Current database version: ${currentVersion}`);
      console.log(`[DatabaseService] Target database version: ${DATABASE_VERSION}`);

      // Run migrations from current version to target version
      for (let version = currentVersion + 1; version <= DATABASE_VERSION; version++) {
        const migration = MIGRATIONS[version as keyof typeof MIGRATIONS];
        
        if (!migration) {
          throw new Error(`Migration for version ${version} not found`);
        }

        console.log(`[DatabaseService] Running migration to version ${version}`);
        
        // Start transaction
        await this.db.execAsync('BEGIN TRANSACTION;');
        
        try {
          // Run migration SQL
          for (const sql of migration.up) {
            await this.db.execAsync(sql);
          }
          
          // Update version
          await this.db.execAsync(`PRAGMA user_version = ${version};`);
          
          // Commit transaction
          await this.db.execAsync('COMMIT;');
          
          console.log(`[DatabaseService] Successfully migrated to version ${version}`);
          
        } catch (error) {
          // Rollback on error
          await this.db.execAsync('ROLLBACK;');
          throw error;
        }
      }

    } catch (error) {
      console.error('[DatabaseService] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create database triggers
   */
  private async createTriggers(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      for (const [name, sql] of Object.entries(CREATE_TRIGGERS)) {
        await this.db.execAsync(sql);
        console.log(`[DatabaseService] Created trigger: ${name}`);
      }
    } catch (error) {
      console.error('[DatabaseService] Failed to create triggers:', error);
      throw error;
    }
  }

  /**
   * Initialize default user data
   */
  private async initializeDefaultData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if default user exists
      const existingPrefs = await this.db.getFirstAsync(
        'SELECT id FROM user_preferences WHERE id = ?',
        ['default_user']
      );

      if (!existingPrefs) {
        // Create default user preferences
        await this.db.runAsync(`
          INSERT INTO user_preferences (id) VALUES ('default_user')
        `);
        
        // Create default health profile
        await this.db.runAsync(`
          INSERT INTO health_profile (id) VALUES ('default_user')
        `);
        
        console.log('[DatabaseService] Created default user data');
      }
    } catch (error) {
      console.error('[DatabaseService] Failed to initialize default data:', error);
      throw error;
    }
  }

  /**
   * Execute a raw SQL query
   */
  public async executeQuery<T = any>(
    sql: string, 
    params: any[] = []
  ): Promise<DatabaseResult<T[]>> {
    try {
      const db = await this.getDatabase();
      const result = await db.getAllAsync<T>(sql, params);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('[DatabaseService] Query failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute a single row query
   */
  public async executeQueryFirst<T = any>(
    sql: string, 
    params: any[] = []
  ): Promise<DatabaseResult<T>> {
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync<T>(sql, params);
      
      return {
        success: true,
        data: result || undefined
      };
    } catch (error) {
      console.error('[DatabaseService] Query failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute an update/insert/delete query
   */
  public async executeUpdate(
    sql: string, 
    params: any[] = []
  ): Promise<DatabaseResult<SQLite.SQLiteRunResult>> {
    try {
      const db = await this.getDatabase();
      const result = await db.runAsync(sql, params);
      
      return {
        success: true,
        data: result,
        rowsAffected: result.changes
      };
    } catch (error) {
      console.error('[DatabaseService] Update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async executeTransaction(
    queries: Array<{ sql: string; params?: any[] }>
  ): Promise<DatabaseResult<void>> {
    try {
      const db = await this.getDatabase();
      
      await db.withTransactionAsync(async () => {
        for (const query of queries) {
          await db.runAsync(query.sql, query.params || []);
        }
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('[DatabaseService] Transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<DatabaseResult<any>> {
    try {
      const db = await this.getDatabase();
      
      const stats = await Promise.all([
        db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sleep_sessions'),
        db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sleep_stages'),
        db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sleep_metrics'),
        db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sleep_insights'),
        db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM ai_interactions'),
        db.getFirstAsync<{ page_size: number, page_count: number }>(
          'PRAGMA page_size; PRAGMA page_count;'
        )
      ]);

      const [sessions, stages, metrics, insights, aiInteractions] = stats;
      const pageInfo = stats[5];

      return {
        success: true,
        data: {
          totalSessions: sessions?.count || 0,
          totalStages: stages?.count || 0,
          totalMetrics: metrics?.count || 0,
          totalInsights: insights?.count || 0,
          totalAIInteractions: aiInteractions?.count || 0,
          databaseSize: (pageInfo?.page_size || 0) * (pageInfo?.page_count || 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Vacuum the database to reclaim space
   */
  public async vacuum(): Promise<DatabaseResult<void>> {
    try {
      const db = await this.getDatabase();
      await db.execAsync('VACUUM;');
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      this.initPromise = null;
      console.log('[DatabaseService] Database connection closed');
    }
  }

  /**
   * Reset the database (for testing or complete data wipe)
   */
  public async reset(): Promise<DatabaseResult<void>> {
    try {
      await this.close();
      
      // Delete the database file
      await SQLite.deleteDatabaseAsync(DATABASE_NAME);
      
      // Reinitialize
      await this.initialize();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if database is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Get database version
   */
  public async getVersion(): Promise<number> {
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version;'
      );
      return result?.user_version || 0;
    } catch (error) {
      console.error('[DatabaseService] Failed to get version:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const database = DatabaseService.getInstance();