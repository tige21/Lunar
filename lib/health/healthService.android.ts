/**
 * Android Health Connect Service Implementation for Lunar Sleep Analysis App
 * Handles all Health Connect integration, permissions, and data synchronization
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  IHealthService,
  HealthServiceConfig,
  HealthPermissions,
  HealthConnectPermissions,
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
  HEALTH_CONNECT_TYPES,
  ANDROID_PERMISSIONS,
  SYNC_RETRY_CONFIG,
  HEALTH_ERROR_CODES,
  HEALTH_ERROR_MESSAGES,
} from './constants';

import {
  processSleepData,
  validateSleepData,
  validateHeartRateData,
  detectSleepConflicts,
  calculateDataQualityMetrics,
  generateHealthInsights,
} from './utils';

// Mock Health Connect API since actual implementation requires native modules
interface HealthConnectAPI {
  isAvailable(): Promise<boolean>;
  requestPermissions(permissions: string[]): Promise<boolean>;
  checkPermissions(permissions: string[]): Promise<Record<string, boolean>>;
  readSleepSessions(startTime: Date, endTime: Date): Promise<any[]>;
  readHeartRateRecords(startTime: Date, endTime: Date): Promise<any[]>;
  readRespiratoryRateRecords(startTime: Date, endTime: Date): Promise<any[]>;
}

// This would be replaced with actual Health Connect implementation
const HealthConnect: HealthConnectAPI = {
  async isAvailable() {
    return Platform.OS === 'android' && Platform.Version >= 28;
  },

  async requestPermissions(permissions: string[]) {
    // Mock implementation - in real app this would use native modules
    console.log('Requesting Health Connect permissions:', permissions);
    return true;
  },

  async checkPermissions(permissions: string[]) {
    // Mock implementation
    const result: Record<string, boolean> = {};
    permissions.forEach(permission => {
      result[permission] = true; // Mock as granted
    });
    return result;
  },

  async readSleepSessions(startTime: Date, endTime: Date) {
    // Mock sleep session data
    return [
      {
        metadata: {
          id: 'mock_sleep_session_1',
          dataOrigin: {
            packageName: 'com.google.android.apps.fitness',
          },
          lastModifiedTime: new Date().toISOString(),
        },
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        title: 'Sleep Session',
        notes: 'Tracked by Google Fit',
        stages: [
          {
            startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
            stage: 'STAGE_TYPE_LIGHT',
          },
          {
            startTime: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            stage: 'STAGE_TYPE_DEEP',
          },
          {
            startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            stage: 'STAGE_TYPE_REM',
          },
          {
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            stage: 'STAGE_TYPE_LIGHT',
          },
        ],
      },
    ];
  },

  async readHeartRateRecords(startTime: Date, endTime: Date) {
    // Mock heart rate data
    const records = [];
    const duration = endTime.getTime() - startTime.getTime();
    const intervals = Math.min(100, Math.floor(duration / (5 * 60 * 1000))); // Every 5 minutes, max 100 points

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(startTime.getTime() + (i * duration / intervals));
      records.push({
        metadata: {
          id: `mock_hr_${i}`,
          dataOrigin: {
            packageName: 'com.google.android.apps.fitness',
          },
          lastModifiedTime: timestamp.toISOString(),
        },
        time: timestamp.toISOString(),
        beatsPerMinute: Math.floor(Math.random() * 30) + 50, // 50-80 BPM for sleep
      });
    }

    return records;
  },

  async readRespiratoryRateRecords(startTime: Date, endTime: Date) {
    // Mock respiratory rate data
    return [
      {
        metadata: {
          id: 'mock_rr_1',
          dataOrigin: {
            packageName: 'com.google.android.apps.fitness',
          },
          lastModifiedTime: new Date().toISOString(),
        },
        time: startTime.toISOString(),
        rate: 16, // breaths per minute
      },
    ];
  },
};

export class HealthConnectService implements IHealthService {
  private config: HealthServiceConfig = DEFAULT_HEALTH_CONFIG;
  private observers: HealthServiceObserver[] = [];
  private syncStatus: SyncStatus = {
    isEnabled: false,
    isCurrentlySyncing: false,
    errorCount: 0,
    permissionsGranted: false,
    backgroundSyncEnabled: false,
  };
  private backgroundSyncTimer?: NodeJS.Timeout;
  private retryAttempts: number = 0;

  /**
   * Initialize Health Connect service
   */
  async initialize(config: HealthServiceConfig): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error(HEALTH_ERROR_MESSAGES[HEALTH_ERROR_CODES.HEALTH_CONNECT_UNAVAILABLE]);
      }

      this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };

      // Check if Health Connect is available
      const isAvailable = await HealthConnect.isAvailable();
      if (!isAvailable) {
        throw new Error(HEALTH_ERROR_MESSAGES[HEALTH_ERROR_CODES.HEALTH_CONNECT_UNAVAILABLE]);
      }

      this.syncStatus.isEnabled = true;
      this.notifyObservers('onServiceInitialized');

      return true;
    } catch (error) {
      console.error('Health Connect initialization failed:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      return false;
    }
  }

  /**
   * Request health data permissions
   */
  async requestPermissions(permissions: HealthPermissions): Promise<boolean> {
    try {
      const healthConnectPermissions = this.mapToHealthConnectPermissions(permissions);
      const granted = await HealthConnect.requestPermissions(healthConnectPermissions);

      // Verify permissions were actually granted
      const grantedPermissions = await this.checkPermissions();
      const allGranted = Object.values(grantedPermissions).every(granted => granted);

      this.syncStatus.permissionsGranted = allGranted;
      this.notifyObservers('onPermissionChanged', grantedPermissions);

      return allGranted;
    } catch (error) {
      console.error('Permission request failed:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Permission denied';
      return false;
    }
  }

  /**
   * Check current permissions
   */
  async checkPermissions(): Promise<HealthPermissions> {
    try {
      const healthConnectPermissions = [
        'android.permission.health.READ_SLEEP',
        'android.permission.health.READ_HEART_RATE',
        'android.permission.health.READ_RESPIRATORY_RATE',
        'android.permission.health.READ_STEPS',
        'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
        'android.permission.health.READ_DISTANCE',
      ];

      const grantedMap = await HealthConnect.checkPermissions(healthConnectPermissions);

      return {
        sleepAnalysis: grantedMap['android.permission.health.READ_SLEEP'] || false,
        heartRate: grantedMap['android.permission.health.READ_HEART_RATE'] || false,
        respiratoryRate: grantedMap['android.permission.health.READ_RESPIRATORY_RATE'] || false,
        activeEnergyBurned: grantedMap['android.permission.health.READ_ACTIVE_CALORIES_BURNED'] || false,
        stepCount: grantedMap['android.permission.health.READ_STEPS'] || false,
        distanceWalkingRunning: grantedMap['android.permission.health.READ_DISTANCE'] || false,
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        sleepAnalysis: false,
        heartRate: false,
        respiratoryRate: false,
        activeEnergyBurned: false,
        stepCount: false,
        distanceWalkingRunning: false,
      };
    }
  }

  /**
   * Sync health data from Health Connect
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
      const endDate = options?.endDate || new Date();
      const startDate = options?.startDate || new Date(endDate.getTime() - this.config.maxHistoryDays * 24 * 60 * 60 * 1000);

      // Fetch sleep data
      const rawSleepData = await this.getSleepData(startDate, endDate);
      
      // Fetch heart rate data
      const rawHeartRateData = await this.getHeartRateData(startDate, endDate);

      // Validate data
      const sleepValidation = validateSleepData(rawSleepData);
      const heartRateValidation = validateHeartRateData(rawHeartRateData);

      if (!sleepValidation.isValid && options?.validateData !== false) {
        throw new Error(`Sleep data validation failed: ${sleepValidation.errors.join(', ')}`);
      }

      if (!heartRateValidation.isValid && options?.validateData !== false) {
        throw new Error(`Heart rate data validation failed: ${heartRateValidation.errors.join(', ')}`);
      }

      // Process sleep data
      const processedSessions = processSleepData(rawSleepData, rawHeartRateData);

      // Handle conflicts if resolution is enabled
      let conflictsFound = 0;
      let conflictsResolved = 0;
      
      if (options?.resolveConflicts && options?.conflictResolution) {
        const conflicts = await this.detectConflicts(processedSessions);
        conflictsFound = conflicts.length;
        
        if (conflicts.length > 0) {
          const resolved = await this.resolveConflicts(conflicts, options.conflictResolution);
          conflictsResolved = resolved ? conflicts.length : 0;
        }
      }

      const result: HealthDataImportResult = {
        success: true,
        sessionsImported: processedSessions.length,
        sessionsSkipped: 0,
        conflictsFound,
        conflictsResolved,
        errors: [],
        warnings: [...sleepValidation.warnings, ...heartRateValidation.warnings],
        processingTime: Date.now() - startTime,
      };

      this.syncStatus.lastSuccessfulSync = new Date();
      this.syncStatus.errorCount = 0;
      this.retryAttempts = 0;

      this.notifyObservers('onSyncCompleted', result);
      this.notifyObservers('onDataImported', processedSessions);

      return result;
    } catch (error) {
      console.error('Health data sync failed:', error);
      
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

      // Retry logic
      if (this.shouldRetry(error)) {
        setTimeout(() => {
          this.syncHealthData(options);
        }, this.calculateRetryDelay());
      }

      return result;
    } finally {
      this.syncStatus.isCurrentlySyncing = false;
    }
  }

  /**
   * Enable background synchronization
   */
  async enableBackgroundSync(config: BackgroundSyncConfig): Promise<boolean> {
    try {
      if (this.backgroundSyncTimer) {
        clearInterval(this.backgroundSyncTimer);
      }

      const interval = Math.max(config.interval * 60 * 1000, 15 * 60 * 1000); // Minimum 15 minutes

      this.backgroundSyncTimer = setInterval(async () => {
        if (!this.isQuietHours(config.quietHours)) {
          await this.syncHealthData();
        }
      }, interval);

      this.syncStatus.backgroundSyncEnabled = true;
      
      // Store background sync config for persistence
      await AsyncStorage.setItem('health_background_sync_config', JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Failed to enable background sync:', error);
      return false;
    }
  }

  /**
   * Disable background synchronization
   */
  async disableBackgroundSync(): Promise<boolean> {
    try {
      if (this.backgroundSyncTimer) {
        clearInterval(this.backgroundSyncTimer);
        this.backgroundSyncTimer = undefined;
      }

      this.syncStatus.backgroundSyncEnabled = false;
      
      // Remove stored config
      await AsyncStorage.removeItem('health_background_sync_config');
      
      return true;
    } catch (error) {
      console.error('Failed to disable background sync:', error);
      return false;
    }
  }

  /**
   * Get sleep data from Health Connect
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<RawSleepData[]> {
    try {
      const sleepSessions = await HealthConnect.readSleepSessions(startDate, endDate);
      const rawSleepData: RawSleepData[] = [];

      sleepSessions.forEach(session => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        const sessionDuration = (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60);

        const source: HealthDataSource = {
          name: session.metadata.dataOrigin.packageName || 'Unknown',
          bundleIdentifier: session.metadata.dataOrigin.packageName || 'unknown',
          platform: 'android',
        };

        // Add overall session
        rawSleepData.push({
          id: session.metadata.id,
          startDate: sessionStart,
          endDate: sessionEnd,
          duration: sessionDuration,
          source,
          category: 'asleep',
          metadata: session.metadata,
        });

        // Add individual stages
        if (session.stages && Array.isArray(session.stages)) {
          session.stages.forEach((stage: any, index: number) => {
            const stageStart = new Date(stage.startTime);
            const stageEnd = new Date(stage.endTime);
            const stageDuration = (stageEnd.getTime() - stageStart.getTime()) / (1000 * 60);

            rawSleepData.push({
              id: `${session.metadata.id}_stage_${index}`,
              startDate: stageStart,
              endDate: stageEnd,
              duration: stageDuration,
              source,
              stage: this.mapHealthConnectStage(stage.stage),
              category: 'asleep',
              metadata: { ...session.metadata, stageType: stage.stage },
            });
          });
        }
      });

      return rawSleepData;
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      throw error;
    }
  }

  /**
   * Get heart rate data from Health Connect
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<RawHeartRateData[]> {
    try {
      const heartRateRecords = await HealthConnect.readHeartRateRecords(startDate, endDate);

      return heartRateRecords.map(record => ({
        id: record.metadata.id,
        timestamp: new Date(record.time),
        value: record.beatsPerMinute,
        source: {
          name: record.metadata.dataOrigin.packageName || 'Unknown',
          bundleIdentifier: record.metadata.dataOrigin.packageName || 'unknown',
          platform: 'android',
        },
        metadata: record.metadata,
      }));
    } catch (error) {
      console.error('Failed to fetch heart rate data:', error);
      throw error;
    }
  }

  /**
   * Get respiratory rate data from Health Connect
   */
  async getRespiratoryRateData(startDate: Date, endDate: Date): Promise<RawRespiratoryRateData[]> {
    try {
      const respiratoryRecords = await HealthConnect.readRespiratoryRateRecords(startDate, endDate);

      return respiratoryRecords.map(record => ({
        id: record.metadata.id,
        timestamp: new Date(record.time),
        value: record.rate,
        source: {
          name: record.metadata.dataOrigin.packageName || 'Unknown',
          bundleIdentifier: record.metadata.dataOrigin.packageName || 'unknown',
          platform: 'android',
        },
        metadata: record.metadata,
      }));
    } catch (error) {
      console.error('Failed to fetch respiratory rate data:', error);
      throw error;
    }
  }

  /**
   * Process sleep data (delegates to utils)
   */
  async processSleepData(rawData: RawSleepData[]): Promise<ProcessedSleepSession[]> {
    return processSleepData(rawData);
  }

  /**
   * Validate data (delegates to utils)
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
   * Resolve data conflicts (placeholder - needs database integration)
   */
  async resolveConflicts(conflicts: DataConflict[], resolutions: ConflictResolution[]): Promise<boolean> {
    // This would typically involve database operations
    console.log('Resolving conflicts:', conflicts.length);
    return true;
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return { ...this.syncStatus };
  }

  /**
   * Get connected devices
   */
  async getConnectedDevices(): Promise<HealthDevice[]> {
    const devices: HealthDevice[] = [];

    try {
      // Check for recent data to infer connected devices
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      
      const sleepData = await this.getSleepData(startDate, endDate);
      const uniqueSources = new Map<string, HealthDataSource>();

      sleepData.forEach(data => {
        uniqueSources.set(data.source.bundleIdentifier, data.source);
      });

      uniqueSources.forEach((source, bundleId) => {
        const deviceType = this.inferDeviceType(bundleId);
        
        devices.push({
          id: bundleId,
          name: this.getDeviceName(bundleId),
          type: deviceType,
          manufacturer: this.getManufacturer(bundleId),
          model: this.getDeviceModel(bundleId),
          isConnected: true,
          lastSyncTime: endDate,
          capabilities: this.getDeviceCapabilities(bundleId),
        });
      });

      // Add generic Android device if no specific sources found
      if (devices.length === 0) {
        devices.push({
          id: 'android_device',
          name: 'Android Device',
          type: 'other',
          manufacturer: 'Android',
          model: 'Phone',
          isConnected: true,
          capabilities: {
            sleepTracking: true,
            heartRateMonitoring: false,
            respiratoryRate: false,
            sleepStages: false,
            continuousMonitoring: false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to get connected devices:', error);
    }

    return devices;
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
    await this.disableBackgroundSync();
    this.observers = [];
    this.syncStatus = {
      isEnabled: false,
      isCurrentlySyncing: false,
      errorCount: 0,
      permissionsGranted: false,
      backgroundSyncEnabled: false,
    };
  }

  // Private helper methods

  private mapToHealthConnectPermissions(permissions: HealthPermissions): string[] {
    const healthConnectPerms: string[] = [];

    if (permissions.sleepAnalysis) {
      healthConnectPerms.push('android.permission.health.READ_SLEEP');
    }

    if (permissions.heartRate) {
      healthConnectPerms.push('android.permission.health.READ_HEART_RATE');
    }

    if (permissions.respiratoryRate) {
      healthConnectPerms.push('android.permission.health.READ_RESPIRATORY_RATE');
    }

    if (permissions.activeEnergyBurned) {
      healthConnectPerms.push('android.permission.health.READ_ACTIVE_CALORIES_BURNED');
    }

    if (permissions.stepCount) {
      healthConnectPerms.push('android.permission.health.READ_STEPS');
    }

    if (permissions.distanceWalkingRunning) {
      healthConnectPerms.push('android.permission.health.READ_DISTANCE');
    }

    return healthConnectPerms;
  }

  private mapHealthConnectStage(stage: string): any {
    // Map Health Connect sleep stage values to our format
    switch (stage) {
      case 'STAGE_TYPE_AWAKE':
        return 'awake';
      case 'STAGE_TYPE_LIGHT':
        return 'core'; // Maps to our 'light' via HEALTHKIT_STAGE_MAPPING
      case 'STAGE_TYPE_DEEP':
        return 'deep';
      case 'STAGE_TYPE_REM':
        return 'rem';
      case 'STAGE_TYPE_SLEEPING':
      default:
        return 'unspecified';
    }
  }

  private async detectConflicts(sessions: ProcessedSleepSession[]): Promise<DataConflict[]> {
    // This would typically involve fetching existing sessions from database
    return [];
  }

  private shouldRetry(error: any): boolean {
    if (this.retryAttempts >= SYNC_RETRY_CONFIG.maxAttempts) {
      return false;
    }

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    return SYNC_RETRY_CONFIG.retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError)
    );
  }

  private calculateRetryDelay(): number {
    const delay = Math.min(
      SYNC_RETRY_CONFIG.baseDelay * Math.pow(SYNC_RETRY_CONFIG.backoffMultiplier, this.retryAttempts),
      SYNC_RETRY_CONFIG.maxDelay
    );
    
    this.retryAttempts++;
    return delay;
  }

  private isQuietHours(quietHours?: { enabled: boolean; startTime: string; endTime: string }): boolean {
    if (!quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private inferDeviceType(bundleId: string): any {
    if (bundleId.includes('fitbit')) return 'fitbit';
    if (bundleId.includes('garmin')) return 'garmin';
    if (bundleId.includes('samsung')) return 'other';
    if (bundleId.includes('google.android.gms')) return 'other';
    return 'other';
  }

  private getDeviceName(bundleId: string): string {
    if (bundleId.includes('fitbit')) return 'Fitbit Device';
    if (bundleId.includes('garmin')) return 'Garmin Device';
    if (bundleId.includes('samsung')) return 'Samsung Health';
    if (bundleId.includes('google.android.gms')) return 'Google Fit';
    return 'Health Connect App';
  }

  private getManufacturer(bundleId: string): string {
    if (bundleId.includes('fitbit')) return 'Fitbit';
    if (bundleId.includes('garmin')) return 'Garmin';
    if (bundleId.includes('samsung')) return 'Samsung';
    if (bundleId.includes('google')) return 'Google';
    return 'Unknown';
  }

  private getDeviceModel(bundleId: string): string {
    if (bundleId.includes('fitbit')) return 'Fitbit Tracker';
    if (bundleId.includes('garmin')) return 'Garmin Watch';
    if (bundleId.includes('samsung')) return 'Galaxy Watch';
    return 'Android Device';
  }

  private getDeviceCapabilities(bundleId: string): any {
    if (bundleId.includes('fitbit') || bundleId.includes('garmin')) {
      return {
        sleepTracking: true,
        heartRateMonitoring: true,
        respiratoryRate: true,
        sleepStages: true,
        continuousMonitoring: true,
      };
    }

    return {
      sleepTracking: true,
      heartRateMonitoring: false,
      respiratoryRate: false,
      sleepStages: false,
      continuousMonitoring: false,
    };
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