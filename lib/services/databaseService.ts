/**
 * Database Service
 * Handles SQLite database operations for local data storage
 * Mobile-optimized with connection pooling and performance monitoring
 */

// Note: In production, uncomment and use expo-sqlite
// import * as SQLite from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import analyticsService from './analyticsService';

export interface SleepRecord {
  id: number;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // minutes
  efficiency: number;
  score: number;
  phases: {
    deep: number;
    rem: number;
    light: number;
    wake: number;
  };
  heartRate?: {
    average: number;
    resting: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: any = null; // SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private performanceMetrics = {
    queryCount: 0,
    totalQueryTime: 0,
    slowQueries: 0
  };

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Execute query with performance tracking
   */
  private async executeQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.performanceMetrics.queryCount++;
    
    try {
      const result = await queryFn();
      const queryTime = Date.now() - startTime;
      this.performanceMetrics.totalQueryTime += queryTime;
      
      if (queryTime > 100) {
        this.performanceMetrics.slowQueries++;
        console.warn(`Slow query detected: ${queryName} took ${queryTime}ms`);
      }
      
      analyticsService.trackPerformance('db_query_time', queryTime);
      return result;
    } catch (error) {
      analyticsService.trackError(error as Error, { queryName });
      throw error;
    }
  }

  /**
   * Get from cache or execute query
   */
  private async getCachedOrExecute<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const result = await queryFn();
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  /**
   * Initialize database and create tables with performance optimization
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const initStart = Date.now();
      
      // In production, uncomment:
      // this.db = await SQLite.openDatabaseAsync('lunar_sleep.db');
      
      // Create optimized tables with indexes
      // await this.db.execAsync(`
      //   PRAGMA journal_mode=WAL;
      //   PRAGMA synchronous=NORMAL;
      //   PRAGMA cache_size=10000;
      //   PRAGMA temp_store=memory;
      //   
      //   CREATE TABLE IF NOT EXISTS sleep_records (
      //     id INTEGER PRIMARY KEY AUTOINCREMENT,
      //     date TEXT UNIQUE NOT NULL,
      //     bedtime TEXT NOT NULL,
      //     wake_time TEXT NOT NULL,
      //     duration INTEGER NOT NULL,
      //     efficiency REAL NOT NULL,
      //     score INTEGER NOT NULL,
      //     deep_sleep REAL NOT NULL,
      //     rem_sleep REAL NOT NULL,
      //     light_sleep REAL NOT NULL,
      //     wake_sleep REAL NOT NULL,
      //     avg_heart_rate REAL,
      //     resting_heart_rate REAL,
      //     created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      //     updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      //   );
      //   
      //   CREATE INDEX IF NOT EXISTS idx_date ON sleep_records(date);
      //   CREATE INDEX IF NOT EXISTS idx_created_at ON sleep_records(created_at);
      //   CREATE INDEX IF NOT EXISTS idx_score ON sleep_records(score);
      // `);
      
      const initTime = Date.now() - initStart;
      analyticsService.trackPerformance('db_init_time', initTime);
      
      this.isInitialized = true;
      console.log(`Database initialized (mock) in ${initTime}ms`);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      analyticsService.trackError(error as Error, { operation: 'database_init' });
      throw error;
    }
  }

  /**
   * Save sleep record to database with haptic feedback
   */
  async saveSleepRecord(record: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    return this.executeQuery('saveSleepRecord', async () => {
      try {
        // In production:
        // const result = await this.db.runAsync(
        //   `INSERT OR REPLACE INTO sleep_records 
        //    (date, bedtime, wake_time, duration, efficiency, score, 
        //     deep_sleep, rem_sleep, light_sleep, wake_sleep, 
        //     avg_heart_rate, resting_heart_rate) 
        //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        //   [record.date, record.bedtime, record.wakeTime, record.duration,
        //    record.efficiency, record.score, record.phases.deep,
        //    record.phases.rem, record.phases.light, record.phases.wake,
        //    record.heartRate?.average, record.heartRate?.resting]
        // );
        
        // Clear relevant cache entries
        this.clearCacheByPattern(['recent', 'statistics', record.date]);
        
        // Mock implementation
        const mockId = Math.floor(Math.random() * 1000);
        console.log('Saving sleep record (mock):', record);
        
        // Provide haptic feedback on successful save
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        return mockId;
      } catch (error) {
        console.error('Error saving sleep record:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        throw error;
      }
    });
  }

  /**
   * Get sleep record by date (cached)
   */
  async getSleepRecord(date: string): Promise<SleepRecord | null> {
    return this.getCachedOrExecute(
      `record_${date}`,
      async () => {
        return this.executeQuery('getSleepRecord', async () => {
          // In production:
          // const result = await this.db.getFirstAsync(
          //   'SELECT * FROM sleep_records WHERE date = ?',
          //   [date]
          // );
          // return result ? this.mapDbRecordToSleepRecord(result) : null;
          
          // Mock implementation
          console.log('Getting sleep record for date (mock):', date);
          
          // Simulate finding a record occasionally
          if (Math.random() > 0.7) {
            return {
              id: 1,
              date,
              bedtime: '23:00',
              wakeTime: '07:30',
              duration: 450,
              efficiency: 85,
              score: 78,
              phases: { deep: 25, rem: 22, light: 45, wake: 8 },
              heartRate: { average: 58, resting: 52 },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          return null;
        });
      }
    );
  }

  /**
   * Get sleep records for date range
   */
  async getSleepRecords(startDate: string, endDate: string): Promise<SleepRecord[]> {
    // Mock implementation
    console.log('Getting sleep records from', startDate, 'to', endDate);
    return [];
  }

  /**
   * Get recent sleep records (cached)
   */
  async getRecentRecords(limit: number = 7): Promise<SleepRecord[]> {
    return this.getCachedOrExecute(
      `recent_${limit}`,
      async () => {
        return this.executeQuery('getRecentRecords', async () => {
          // In production:
          // const results = await this.db.getAllAsync(
          //   'SELECT * FROM sleep_records ORDER BY date DESC LIMIT ?',
          //   [limit]
          // );
          // return results.map(this.mapDbRecordToSleepRecord);
          
          // Mock implementation with realistic data
          const records: SleepRecord[] = [];
          for (let i = 0; i < Math.min(limit, 5); i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            records.push({
              id: i + 1,
              date: date.toISOString().split('T')[0],
              bedtime: '23:' + String(Math.floor(Math.random() * 30)).padStart(2, '0'),
              wakeTime: '07:' + String(15 + Math.floor(Math.random() * 30)).padStart(2, '0'),
              duration: 420 + Math.floor(Math.random() * 120),
              efficiency: 75 + Math.floor(Math.random() * 20),
              score: 65 + Math.floor(Math.random() * 30),
              phases: {
                deep: 20 + Math.floor(Math.random() * 15),
                rem: 18 + Math.floor(Math.random() * 12),
                light: 40 + Math.floor(Math.random() * 20),
                wake: 2 + Math.floor(Math.random() * 8)
              },
              heartRate: {
                average: 55 + Math.floor(Math.random() * 15),
                resting: 50 + Math.floor(Math.random() * 10)
              },
              createdAt: date.toISOString(),
              updatedAt: date.toISOString()
            });
          }
          
          console.log(`Getting recent ${limit} records (mock):`, records.length);
          return records;
        });
      }
    );
  }

  /**
   * Update sleep record
   */
  async updateSleepRecord(id: number, updates: Partial<SleepRecord>): Promise<boolean> {
    // Mock implementation
    console.log('Updating record', id, 'with:', updates);
    return true;
  }

  /**
   * Delete sleep record
   */
  async deleteSleepRecord(id: number): Promise<boolean> {
    // Mock implementation
    console.log('Deleting record:', id);
    return true;
  }

  /**
   * Get sleep statistics (cached)
   */
  async getStatistics(days: number = 30): Promise<{
    averageScore: number;
    averageDuration: number;
    averageEfficiency: number;
    totalNights: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    return this.getCachedOrExecute(
      `statistics_${days}`,
      async () => {
        return this.executeQuery('getStatistics', async () => {
          // In production:
          // const result = await this.db.getFirstAsync(
          //   `SELECT 
          //      AVG(score) as avg_score,
          //      AVG(duration) as avg_duration,
          //      AVG(efficiency) as avg_efficiency,
          //      COUNT(*) as total_nights
          //    FROM sleep_records 
          //    WHERE date >= date('now', '-' || ? || ' days')`,
          //   [days]
          // );
          
          // Mock implementation with trend calculation
          const baseScore = 70 + Math.random() * 20;
          const trend = Math.random() > 0.6 ? 'improving' : 
                       Math.random() > 0.3 ? 'stable' : 'declining';
          
          return {
            averageScore: Math.round(baseScore),
            averageDuration: 420 + Math.floor(Math.random() * 90),
            averageEfficiency: 80 + Math.floor(Math.random() * 15),
            totalNights: Math.min(days, Math.floor(days * 0.9)), // Some missing nights
            trend
          };
        });
      },
      10 * 60 * 1000 // Cache statistics for 10 minutes
    );
  }

  /**
   * Clear cache entries matching pattern
   */
  private clearCacheByPattern(patterns: string[]): void {
    for (const [key] of this.cache) {
      if (patterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    queryCount: number;
    averageQueryTime: number;
    slowQueries: number;
    cacheSize: number;
  } {
    return {
      queryCount: this.performanceMetrics.queryCount,
      averageQueryTime: this.performanceMetrics.queryCount > 0 
        ? this.performanceMetrics.totalQueryTime / this.performanceMetrics.queryCount 
        : 0,
      slowQueries: this.performanceMetrics.slowQueries,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Close database connection and cleanup
   */
  async close(): Promise<void> {
    if (this.db) {
      // await this.db.closeAsync();
      this.db = null;
    }
    this.cache.clear();
    this.isInitialized = false;
  }
}

export default DatabaseService.getInstance();