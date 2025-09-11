/**
 * Web Health Service Implementation for Lunar Sleep Analysis App
 * Provides manual data entry and file import capabilities for web platform
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  IHealthService,
  HealthServiceConfig,
  HealthPermissions,
  RawSleepData,
  RawHeartRateData,
  RawRespiratoryRateData,
  ProcessedSleepSession,
  HealthDataImportOptions,
  HealthDataImportResult,
  SyncStatus,
  HealthDevice,
  DataQualityMetrics,
  HealthServiceObserver,
  BackgroundSyncConfig,
  HealthDataSource,
  DataConflict,
  ConflictResolution,
  DataValidationResult,
} from './types';

import {
  DEFAULT_HEALTH_CONFIG,
  HEALTH_ERROR_CODES,
  HEALTH_ERROR_MESSAGES,
} from './constants';

import {
  processSleepData,
  validateSleepData,
  validateHeartRateData,
  calculateDataQualityMetrics,
} from './utils';

export class WebHealthService implements IHealthService {
  private config: HealthServiceConfig = DEFAULT_HEALTH_CONFIG;
  private observers: HealthServiceObserver[] = [];
  private syncStatus: SyncStatus = {
    isEnabled: false,
    isCurrentlySyncing: false,
    errorCount: 0,
    permissionsGranted: true, // No permissions needed for web
    backgroundSyncEnabled: false,
  };

  /**
   * Initialize web health service
   */
  async initialize(config: HealthServiceConfig): Promise<boolean> {
    try {
      this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };
      this.syncStatus.isEnabled = true;
      this.notifyObservers('onServiceInitialized');
      return true;
    } catch (error) {
      console.error('Web health service initialization failed:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  /**
   * Request permissions (no-op for web)
   */
  async requestPermissions(permissions: HealthPermissions): Promise<boolean> {
    // Web platform doesn't require permissions for manual data entry
    this.syncStatus.permissionsGranted = true;
    this.notifyObservers('onPermissionChanged', permissions);
    return true;
  }

  /**
   * Check permissions (always granted for web)
   */
  async checkPermissions(): Promise<HealthPermissions> {
    return {
      sleepAnalysis: true,
      heartRate: true,
      respiratoryRate: true,
      activeEnergyBurned: true,
      stepCount: true,
      distanceWalkingRunning: true,
    };
  }

  /**
   * Sync health data (manual import for web)
   */
  async syncHealthData(options?: HealthDataImportOptions): Promise<HealthDataImportResult> {
    if (this.syncStatus.isCurrentlySyncing) {
      return {
        success: false,
        sessionsImported: 0,
        sessionsSkipped: 0,
        conflictsFound: 0,
        conflictsResolved: 0,
        errors: [HEALTH_ERROR_MESSAGES[HEALTH_ERROR_CODES.SYNC_IN_PROGRESS]],
        warnings: [],
        processingTime: 0,
      };
    }

    const startTime = Date.now();
    this.syncStatus.isCurrentlySyncing = true;
    this.syncStatus.lastSyncTime = new Date();

    this.notifyObservers('onSyncStarted');

    try {
      // For web, we'll check for locally stored data or provide sample data
      const endDate = options?.endDate || new Date();
      const startDate = options?.startDate || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

      // Get stored sleep data or generate sample data
      const rawSleepData = await this.getSleepData(startDate, endDate);
      const rawHeartRateData = await this.getHeartRateData(startDate, endDate);

      // Validate data
      const sleepValidation = validateSleepData(rawSleepData);
      const heartRateValidation = validateHeartRateData(rawHeartRateData);

      // Process sleep data
      const processedSessions = processSleepData(rawSleepData, rawHeartRateData);

      const result: HealthDataImportResult = {
        success: true,
        sessionsImported: processedSessions.length,
        sessionsSkipped: 0,
        conflictsFound: 0,
        conflictsResolved: 0,
        errors: [],
        warnings: [...sleepValidation.warnings, ...heartRateValidation.warnings],
        processingTime: Date.now() - startTime,
      };

      this.syncStatus.lastSuccessfulSync = new Date();
      this.syncStatus.errorCount = 0;

      this.notifyObservers('onSyncCompleted', result);
      this.notifyObservers('onDataImported', processedSessions);

      return result;
    } catch (error) {
      console.error('Web health data sync failed:', error);
      
      this.syncStatus.errorCount++;
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';

      const result: HealthDataImportResult = {
        success: false,
        sessionsImported: 0,
        sessionsSkipped: 0,
        conflictsFound: 0,
        conflictsResolved: 0,
        errors: [this.syncStatus.lastError],
        warnings: [],
        processingTime: Date.now() - startTime,
      };

      this.notifyObservers('onSyncFailed', error);
      return result;
    } finally {
      this.syncStatus.isCurrentlySyncing = false;
    }
  }

  /**
   * Enable background sync (not supported on web)
   */
  async enableBackgroundSync(config: BackgroundSyncConfig): Promise<boolean> {
    console.warn('Background sync not supported on web platform');
    return false;
  }

  /**
   * Disable background sync (not supported on web)
   */
  async disableBackgroundSync(): Promise<boolean> {
    return true;
  }

  /**
   * Get sleep data (from local storage or sample data)
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<RawSleepData[]> {
    try {
      // Try to get stored data first
      const storedData = await AsyncStorage.getItem('web_sleep_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const filteredData = parsed.filter((session: any) => {
          const sessionDate = new Date(session.startDate);
          return sessionDate >= startDate && sessionDate <= endDate;
        });
        
        if (filteredData.length > 0) {
          return filteredData.map((session: any) => ({
            ...session,
            startDate: new Date(session.startDate),
            endDate: new Date(session.endDate),
          }));
        }
      }

      // Generate sample data if no stored data exists
      return this.generateSampleSleepData(startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch web sleep data:', error);
      return this.generateSampleSleepData(startDate, endDate);
    }
  }

  /**
   * Get heart rate data (from local storage or sample data)
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<RawHeartRateData[]> {
    try {
      // Try to get stored data first
      const storedData = await AsyncStorage.getItem('web_heart_rate_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const filteredData = parsed.filter((reading: any) => {
          const readingDate = new Date(reading.timestamp);
          return readingDate >= startDate && readingDate <= endDate;
        });
        
        if (filteredData.length > 0) {
          return filteredData.map((reading: any) => ({
            ...reading,
            timestamp: new Date(reading.timestamp),
          }));
        }
      }

      // Generate sample data if no stored data exists
      return this.generateSampleHeartRateData(startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch web heart rate data:', error);
      return this.generateSampleHeartRateData(startDate, endDate);
    }
  }

  /**
   * Get respiratory rate data (placeholder for web)
   */
  async getRespiratoryRateData(startDate: Date, endDate: Date): Promise<RawRespiratoryRateData[]> {
    return []; // Not typically available on web
  }

  /**
   * Process sleep data
   */
  async processSleepData(rawData: RawSleepData[]): Promise<ProcessedSleepSession[]> {
    return processSleepData(rawData);
  }

  /**
   * Validate data
   */
  validateData(data: any): DataValidationResult {
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].stage !== undefined) {
        return validateSleepData(data);
      } else if (data[0].value !== undefined) {
        return validateHeartRateData(data);
      }
    }
    
    return {
      isValid: false,
      errors: ['Unknown data format'],
      warnings: [],
      confidence: 0,
    };
  }

  /**
   * Resolve conflicts
   */
  async resolveConflicts(conflicts: DataConflict[], resolutions: ConflictResolution[]): Promise<boolean> {
    console.log('Resolving conflicts on web:', conflicts.length);
    return true;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return { ...this.syncStatus };
  }

  /**
   * Get connected devices (always empty for web)
   */
  async getConnectedDevices(): Promise<HealthDevice[]> {
    return [];
  }

  /**
   * Get data quality metrics
   */
  async getDataQualityMetrics(): Promise<DataQualityMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
      
      const rawSleepData = await this.getSleepData(startDate, endDate);
      const processedSessions = processSleepData(rawSleepData);

      return calculateDataQualityMetrics(processedSessions, { start: startDate, end: endDate });
    } catch (error) {
      console.error('Failed to calculate data quality metrics:', error);
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        sourceReliability: 0,
        dataFreshness: 0,
        gapAnalysis: {
          totalGaps: 0,
          longestGap: 0,
          averageGap: 0,
        },
      };
    }
  }

  /**
   * Add observer
   */
  addObserver(observer: HealthServiceObserver): void {
    this.observers.push(observer);
  }

  /**
   * Remove observer
   */
  removeObserver(observer: HealthServiceObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    this.observers = [];
    this.syncStatus = {
      isEnabled: false,
      isCurrentlySyncing: false,
      errorCount: 0,
      permissionsGranted: false,
      backgroundSyncEnabled: false,
    };
  }

  // Web-specific methods

  /**
   * Import sleep data from file (web-specific)
   */
  async importFromFile(file: File): Promise<HealthDataImportResult> {
    const startTime = Date.now();
    
    try {
      const text = await file.text();
      let data;

      // Parse different file formats
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = this.parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      // Validate and process data
      const validation = this.validateData(data);
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      // Store imported data
      await AsyncStorage.setItem('web_sleep_data', JSON.stringify(data));

      return {
        success: true,
        sessionsImported: data.length,
        sessionsSkipped: 0,
        conflictsFound: 0,
        conflictsResolved: 0,
        errors: [],
        warnings: validation.warnings,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        sessionsImported: 0,
        sessionsSkipped: 0,
        conflictsFound: 0,
        conflictsResolved: 0,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        warnings: [],
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Export sleep data to file (web-specific)
   */
  async exportToFile(format: 'json' | 'csv' = 'json'): Promise<Blob | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
      
      const sleepData = await this.getSleepData(startDate, endDate);
      
      if (format === 'json') {
        const jsonData = JSON.stringify(sleepData, null, 2);
        return new Blob([jsonData], { type: 'application/json' });
      } else if (format === 'csv') {
        const csvData = this.generateCSV(sleepData);
        return new Blob([csvData], { type: 'text/csv' });
      }
      
      return null;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  /**
   * Add manual sleep session (web-specific)
   */
  async addManualSleepSession(session: {
    startTime: Date;
    endTime: Date;
    quality?: number;
    notes?: string;
  }): Promise<boolean> {
    try {
      const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      
      const sleepData: RawSleepData = {
        id: `manual_${Date.now()}`,
        startDate: session.startTime,
        endDate: session.endTime,
        duration,
        source: {
          name: 'Manual Entry',
          bundleIdentifier: 'manual_entry',
          platform: 'web',
        },
        category: 'asleep',
        metadata: {
          manual: true,
          quality: session.quality,
          notes: session.notes,
        },
      };

      // Get existing data
      const existingData = await AsyncStorage.getItem('web_sleep_data');
      const sessions = existingData ? JSON.parse(existingData) : [];
      
      // Add new session
      sessions.push(sleepData);
      
      // Store updated data
      await AsyncStorage.setItem('web_sleep_data', JSON.stringify(sessions));
      
      return true;
    } catch (error) {
      console.error('Failed to add manual sleep session:', error);
      return false;
    }
  }

  // Private helper methods

  private generateSampleSleepData(startDate: Date, endDate: Date): RawSleepData[] {
    const sessions: RawSleepData[] = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i < Math.min(days, 7); i++) {
      const sessionDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Generate bedtime between 22:00 and 23:30
      const bedtimeHour = 22 + Math.random() * 1.5;
      const bedtime = new Date(sessionDate);
      bedtime.setHours(Math.floor(bedtimeHour), Math.floor((bedtimeHour % 1) * 60), 0, 0);
      
      // Generate wake time between 6:00 and 8:00 next day
      const wakeHour = 6 + Math.random() * 2;
      const wakeTime = new Date(bedtime.getTime() + 24 * 60 * 60 * 1000);
      wakeTime.setHours(Math.floor(wakeHour), Math.floor((wakeHour % 1) * 60), 0, 0);
      
      const duration = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60);
      
      sessions.push({
        id: `sample_session_${i}`,
        startDate: bedtime,
        endDate: wakeTime,
        duration,
        source: {
          name: 'Sample Data',
          bundleIdentifier: 'sample_data',
          platform: 'web',
        },
        category: 'asleep',
        metadata: { generated: true },
      });
    }
    
    return sessions;
  }

  private generateSampleHeartRateData(startDate: Date, endDate: Date): RawHeartRateData[] {
    const readings: RawHeartRateData[] = [];
    const sleepSessions = this.generateSampleSleepData(startDate, endDate);
    
    sleepSessions.forEach((session, sessionIndex) => {
      const sessionDuration = session.endDate.getTime() - session.startDate.getTime();
      const intervals = Math.floor(sessionDuration / (5 * 60 * 1000)); // Every 5 minutes
      
      for (let i = 0; i < intervals; i++) {
        const timestamp = new Date(session.startDate.getTime() + (i * sessionDuration / intervals));
        const baseRate = 55 + Math.random() * 15; // 55-70 BPM for sleep
        
        readings.push({
          id: `sample_hr_${sessionIndex}_${i}`,
          timestamp,
          value: Math.floor(baseRate),
          source: {
            name: 'Sample Data',
            bundleIdentifier: 'sample_data',
            platform: 'web',
          },
        });
      }
    });
    
    return readings;
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // Convert date strings to Date objects
        if (row.startDate) row.startDate = new Date(row.startDate);
        if (row.endDate) row.endDate = new Date(row.endDate);
        if (row.duration) row.duration = parseFloat(row.duration);
        
        data.push(row);
      }
    }
    
    return data;
  }

  private generateCSV(data: RawSleepData[]): string {
    if (data.length === 0) return '';
    
    const headers = ['id', 'startDate', 'endDate', 'duration', 'source', 'category'];
    const csvLines = [headers.join(',')];
    
    data.forEach(session => {
      const row = [
        session.id,
        session.startDate.toISOString(),
        session.endDate.toISOString(),
        session.duration.toString(),
        session.source.name,
        session.category || '',
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }

  private notifyObservers(event: keyof HealthServiceObserver, data?: any): void {
    this.observers.forEach(observer => {
      const handler = observer[event];
      if (handler && typeof handler === 'function') {
        try {
          handler(data);
        } catch (error) {
          console.error('Observer notification failed:', error);
        }
      }
    });
  }
}