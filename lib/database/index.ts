/**
 * Database module exports for Lunar Sleep Analysis App
 * Central entry point for all database-related functionality
 */

// Core database service
export { database, DatabaseService } from './database';

// Specialized services
export { sleepService, SleepService } from './sleepService';
export { userService, UserService } from './userService';
export { aiService, AIService } from './aiService';
export { dataService, DataService } from './dataService';

// Types
export type * from './types';

// Schema constants
export {
  DATABASE_VERSION,
  DATABASE_NAME,
  CREATE_TABLES,
  CREATE_INDEXES,
  MIGRATIONS,
  CREATE_TRIGGERS,
  DATA_CONSTRAINTS
} from './schema';

// Utility functions for database initialization and management
export class DatabaseManager {
  private static isInitialized = false;

  /**
   * Initialize all database services
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[DatabaseManager] Already initialized');
      return;
    }

    try {
      console.log('[DatabaseManager] Initializing database services...');
      
      // Initialize core database first
      const dbResult = await database.initialize();
      if (!dbResult.success) {
        throw new Error(`Database initialization failed: ${dbResult.error}`);
      }

      // All services use the same database instance, so no additional initialization needed
      console.log('[DatabaseManager] All services initialized successfully');
      
      this.isInitialized = true;

    } catch (error) {
      console.error('[DatabaseManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if database is ready for use
   */
  static isReady(): boolean {
    return this.isInitialized && database.isReady();
  }

  /**
   * Get database health status
   */
  static async getHealthStatus(): Promise<{
    isHealthy: boolean;
    version: number;
    stats?: any;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if database is initialized
      if (!this.isReady()) {
        issues.push('Database not initialized');
        return { isHealthy: false, version: 0, issues };
      }

      // Get database version
      const version = await database.getVersion();
      
      // Get basic stats
      const statsResult = await database.getStats();
      const stats = statsResult.success ? statsResult.data : undefined;

      if (!statsResult.success) {
        issues.push('Failed to get database statistics');
      }

      // Validate data integrity
      const validationResult = await dataService.validateDataIntegrity();
      if (validationResult.success && validationResult.data) {
        if (!validationResult.data.isValid) {
          issues.push(...validationResult.data.issues);
        }
      } else {
        issues.push('Failed to validate data integrity');
      }

      return {
        isHealthy: issues.length === 0,
        version,
        stats,
        issues
      };

    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isHealthy: false, version: 0, issues };
    }
  }

  /**
   * Perform database maintenance tasks
   */
  static async performMaintenance(): Promise<{
    success: boolean;
    tasksCompleted: string[];
    errors: string[];
  }> {
    const tasksCompleted: string[] = [];
    const errors: string[] = [];

    try {
      // Clean up expired insights
      const insightsResult = await userService.cleanupExpiredInsights();
      if (insightsResult.success) {
        tasksCompleted.push(`Cleaned up ${insightsResult.data} expired insights`);
      } else {
        errors.push(`Insights cleanup failed: ${insightsResult.error}`);
      }

      // Repair data integrity issues
      const repairResult = await dataService.repairDataIntegrity();
      if (repairResult.success) {
        if (repairResult.data!.repaired > 0) {
          tasksCompleted.push(`Repaired ${repairResult.data!.repaired} data integrity issues`);
        } else {
          tasksCompleted.push('No data integrity issues found');
        }
      } else {
        errors.push(`Data repair failed: ${repairResult.error}`);
      }

      // Vacuum database
      const vacuumResult = await database.vacuum();
      if (vacuumResult.success) {
        tasksCompleted.push('Database vacuumed successfully');
      } else {
        errors.push(`Database vacuum failed: ${vacuumResult.error}`);
      }

      return {
        success: errors.length === 0,
        tasksCompleted,
        errors
      };

    } catch (error) {
      errors.push(`Maintenance failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, tasksCompleted, errors };
    }
  }

  /**
   * Reset all data (use with caution)
   */
  static async resetAllData(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    console.warn('[DatabaseManager] Resetting all data - this cannot be undone!');
    
    const result = await database.reset();
    if (!result.success) {
      throw new Error(`Database reset failed: ${result.error}`);
    }

    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Close all database connections
   */
  static async shutdown(): Promise<void> {
    if (this.isInitialized) {
      await database.close();
      this.isInitialized = false;
      console.log('[DatabaseManager] Database services shut down');
    }
  }
}

// Convenience functions for common operations

/**
 * Initialize database on app startup
 */
export const initializeDatabase = DatabaseManager.initialize;

/**
 * Get quick sleep session summary
 */
export async function getQuickSleepSummary(userId: string = 'default_user', days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [recentSessions, activeGoal, unreadInsights] = await Promise.all([
    sleepService.getSessions({ userId, startDate, endDate }, { limit: days }),
    userService.getActiveGoal(userId),
    userService.getUnreadInsightsCount(userId)
  ]);

  return {
    recentSessions: recentSessions.success ? recentSessions.data : [],
    activeGoal: activeGoal.success ? activeGoal.data : null,
    unreadInsights: unreadInsights.success ? unreadInsights.data : 0,
    averageScore: recentSessions.success && recentSessions.data && recentSessions.data.length > 0
      ? Math.round(recentSessions.data.reduce((sum, session) => sum + session.quality.overall, 0) / recentSessions.data.length)
      : 0
  };
}

/**
 * Create a complete sleep session with automatic metrics calculation
 */
export async function createCompleteSleepSession(
  sessionData: {
    userId?: string;
    startTime: Date;
    endTime: Date;
    stages: Array<{ stage: 'awake' | 'light' | 'deep' | 'rem'; startTime: Date; endTime: Date }>;
    quality: { overall: number; efficiency: number; restfulness: number };
    notes?: string;
  }
) {
  const duration = Math.round((sessionData.endTime.getTime() - sessionData.startTime.getTime()) / (1000 * 60));
  
  const session = {
    userId: sessionData.userId || 'default_user',
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
    duration,
    quality: sessionData.quality,
    stages: sessionData.stages.map(stage => ({
      id: '', // Will be generated
      sessionId: '', // Will be set by service
      stage: stage.stage,
      startTime: stage.startTime,
      endTime: stage.endTime,
      duration: Math.round((stage.endTime.getTime() - stage.startTime.getTime()) / (1000 * 60))
    })),
    notes: sessionData.notes
  };

  return sleepService.createSession(session);
}

// Export database manager for advanced usage
export { DatabaseManager };