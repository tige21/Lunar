/**
 * Health Integration Service Usage Examples for Lunar Sleep Analysis App
 * Demonstrates how to use the health services across different platforms
 */

import { 
  HealthServiceManager,
  getHealthService,
  HealthServiceFactory,
} from './index';

import { HealthDatabaseIntegration } from './healthDatabaseIntegration';
import { generateHealthInsights } from './utils';

/**
 * Complete health integration setup example
 */
export class HealthIntegrationExample {
  private healthManager: HealthServiceManager;
  private dbIntegration: HealthDatabaseIntegration;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.healthManager = new HealthServiceManager();
    this.dbIntegration = new HealthDatabaseIntegration();
  }

  /**
   * Initialize health integration with full setup
   */
  async initializeHealthIntegration(): Promise<boolean> {
    try {
      console.log('🏃 Starting health integration initialization...');

      // Check platform capabilities
      const capabilities = HealthServiceFactory.getPlatformCapabilities();
      console.log('📱 Platform capabilities:', capabilities);

      // Initialize health service
      const initSuccess = await this.healthManager.initialize({
        enableBackgroundSync: capabilities.supportsBackgroundSync,
        syncInterval: 30, // 30 minutes
        maxHistoryDays: 730, // 2 years
        deduplicationWindow: 5,
        qualityThreshold: 30,
        retryAttempts: 3,
        retryDelay: 5000,
      });

      if (!initSuccess) {
        throw new Error('Health service initialization failed');
      }

      console.log('✅ Health service initialized successfully');

      // Perform initial sync
      const syncSuccess = await this.healthManager.performInitialSync();
      if (syncSuccess) {
        console.log('✅ Initial health data sync completed');
      } else {
        console.warn('⚠️ Initial health data sync failed');
      }

      // Setup background sync if supported
      if (capabilities.supportsBackgroundSync) {
        const backgroundSyncSuccess = await this.healthManager.setupBackgroundSync(30);
        if (backgroundSyncSuccess) {
          console.log('✅ Background sync enabled');
        } else {
          console.warn('⚠️ Background sync setup failed');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Health integration initialization failed:', error);
      return false;
    }
  }

  /**
   * Perform comprehensive health data sync with database integration
   */
  async performComprehensiveSync(): Promise<void> {
    try {
      console.log('🔄 Starting comprehensive health data sync...');

      const healthService = this.healthManager.getHealthService();

      // Check sync status
      const syncStatus = await healthService.getSyncStatus();
      console.log('📊 Current sync status:', syncStatus);

      if (syncStatus.isCurrentlySyncing) {
        console.log('⏳ Sync already in progress, waiting...');
        return;
      }

      // Perform health data sync
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const syncResult = await healthService.syncHealthData({
        startDate,
        endDate,
        validateData: true,
        resolveConflicts: true,
        conflictResolution: [],
        dryRun: false,
      });

      console.log('📈 Sync result:', {
        success: syncResult.success,
        sessionsImported: syncResult.sessionsImported,
        errors: syncResult.errors.length,
        warnings: syncResult.warnings.length,
        processingTime: `${syncResult.processingTime}ms`,
      });

      if (!syncResult.success) {
        console.error('❌ Health data sync failed:', syncResult.errors);
        return;
      }

      // Get processed sessions for database import
      const rawSleepData = await healthService.getSleepData(startDate, endDate);
      const rawHeartRateData = await healthService.getHeartRateData(startDate, endDate);
      const processedSessions = await healthService.processSleepData(rawSleepData);

      console.log(`🔍 Found ${processedSessions.length} processed sleep sessions`);

      // Import sessions into database
      const importResult = await this.dbIntegration.importHealthSessions(
        processedSessions,
        this.userId,
        {
          resolveConflicts: true,
          skipDuplicates: false,
          updateExisting: true,
        }
      );

      console.log('💾 Database import result:', {
        success: importResult.success,
        imported: importResult.sessionsImported,
        skipped: importResult.sessionsSkipped,
        conflicts: importResult.conflictsFound,
        resolved: importResult.conflictsResolved,
      });

      // Generate and import insights
      await this.generateAndImportInsights(processedSessions);

      console.log('✅ Comprehensive sync completed successfully');
    } catch (error) {
      console.error('❌ Comprehensive sync failed:', error);
      throw error;
    }
  }

  /**
   * Generate health insights and import them to database
   */
  async generateAndImportInsights(sessions: any[]): Promise<void> {
    try {
      console.log('🧠 Generating health insights...');

      // Generate insights from processed sessions
      const insights = generateHealthInsights(sessions, 14); // 14 days window
      console.log(`💡 Generated ${insights.length} insights`);

      if (insights.length > 0) {
        // Import insights into database
        const importedCount = await this.dbIntegration.importHealthInsights(insights, this.userId);
        console.log(`✅ Imported ${importedCount} insights into database`);
      }
    } catch (error) {
      console.error('❌ Failed to generate/import insights:', error);
    }
  }

  /**
   * Get comprehensive health status report
   */
  async getHealthStatusReport(): Promise<any> {
    try {
      console.log('📋 Generating health status report...');

      // Get health service status
      const healthStatus = await this.healthManager.getHealthStatus();
      
      // Get database statistics
      const dbStats = await this.dbIntegration.getHealthDataStatistics(this.userId, 30);

      // Get data quality metrics
      const healthService = this.healthManager.getHealthService();
      const qualityMetrics = await healthService.getDataQualityMetrics();

      // Get connected devices
      const devices = await healthService.getConnectedDevices();

      const report = {
        timestamp: new Date().toISOString(),
        platform: healthStatus.platform,
        capabilities: healthStatus.capabilities,
        
        sync: {
          isEnabled: healthStatus.syncStatus.isEnabled,
          lastSync: healthStatus.syncStatus.lastSyncTime,
          lastSuccessfulSync: healthStatus.syncStatus.lastSuccessfulSync,
          errorCount: healthStatus.syncStatus.errorCount,
          lastError: healthStatus.syncStatus.lastError,
          backgroundSyncEnabled: healthStatus.syncStatus.backgroundSyncEnabled,
        },

        permissions: healthStatus.permissions,

        database: {
          totalSessions: dbStats.totalSessions,
          averageQuality: Math.round(dbStats.averageQuality),
          dataCompleteness: Math.round(dbStats.dataCompleteness),
          sourcesUsed: dbStats.sourcesUsed,
          lastSyncTime: dbStats.lastSyncTime,
        },

        dataQuality: {
          completeness: Math.round(qualityMetrics.completeness),
          accuracy: Math.round(qualityMetrics.accuracy),
          consistency: Math.round(qualityMetrics.consistency),
          timeliness: Math.round(qualityMetrics.timeliness),
          sourceReliability: Math.round(qualityMetrics.sourceReliability),
          dataFreshness: Math.round(qualityMetrics.dataFreshness),
          gaps: qualityMetrics.gapAnalysis,
        },

        devices: devices.map(device => ({
          name: device.name,
          type: device.type,
          manufacturer: device.manufacturer,
          isConnected: device.isConnected,
          lastSync: device.lastSyncTime,
          capabilities: device.capabilities,
        })),
      };

      console.log('📊 Health status report generated');
      return report;
    } catch (error) {
      console.error('❌ Failed to generate health status report:', error);
      throw error;
    }
  }

  /**
   * Manual sync trigger for testing
   */
  async triggerManualSync(): Promise<boolean> {
    try {
      console.log('🔄 Triggering manual health data sync...');
      
      const result = await this.performComprehensiveSync();
      console.log('✅ Manual sync completed');
      return true;
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      return false;
    }
  }

  /**
   * Test health service permissions
   */
  async testPermissions(): Promise<void> {
    try {
      console.log('🔐 Testing health permissions...');

      const healthService = this.healthManager.getHealthService();
      
      // Check current permissions
      const currentPermissions = await healthService.checkPermissions();
      console.log('📋 Current permissions:', currentPermissions);

      // Request additional permissions if needed
      const requiredPermissions = {
        sleepAnalysis: true,
        heartRate: true,
        respiratoryRate: true,
        activeEnergyBurned: false,
        stepCount: false,
        distanceWalkingRunning: false,
      };

      const allGranted = Object.entries(requiredPermissions).every(([key, required]) => 
        !required || currentPermissions[key as keyof typeof currentPermissions]
      );

      if (!allGranted) {
        console.log('🔒 Requesting additional permissions...');
        const permissionResult = await healthService.requestPermissions(requiredPermissions);
        
        if (permissionResult) {
          console.log('✅ All required permissions granted');
        } else {
          console.warn('⚠️ Some permissions were denied');
        }
      } else {
        console.log('✅ All required permissions already granted');
      }
    } catch (error) {
      console.error('❌ Permission test failed:', error);
    }
  }

  /**
   * Test data validation
   */
  async testDataValidation(): Promise<void> {
    try {
      console.log('🔍 Testing data validation...');

      const healthService = this.healthManager.getHealthService();
      
      // Get recent data for validation
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const sleepData = await healthService.getSleepData(startDate, endDate);
      const heartRateData = await healthService.getHeartRateData(startDate, endDate);

      // Validate sleep data
      const sleepValidation = healthService.validateData(sleepData);
      console.log('😴 Sleep data validation:', {
        isValid: sleepValidation.isValid,
        errors: sleepValidation.errors.length,
        warnings: sleepValidation.warnings.length,
        confidence: sleepValidation.confidence,
      });

      // Validate heart rate data
      const hrValidation = healthService.validateData(heartRateData);
      console.log('❤️ Heart rate validation:', {
        isValid: hrValidation.isValid,
        errors: hrValidation.errors.length,
        warnings: hrValidation.warnings.length,
        confidence: hrValidation.confidence,
      });

      if (sleepValidation.errors.length > 0) {
        console.warn('⚠️ Sleep data validation errors:', sleepValidation.errors);
      }

      if (hrValidation.errors.length > 0) {
        console.warn('⚠️ Heart rate validation errors:', hrValidation.errors);
      }

    } catch (error) {
      console.error('❌ Data validation test failed:', error);
    }
  }

  /**
   * Cleanup health integration
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up health integration...');
      await this.healthManager.cleanup();
      console.log('✅ Health integration cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

/**
 * Simple usage examples for different platforms
 */
export class SimplePlatformExamples {
  
  /**
   * iOS HealthKit example
   */
  static async iosExample(): Promise<void> {
    if (HealthServiceFactory.getCurrentPlatform() !== 'ios') {
      console.log('❌ This example is only for iOS');
      return;
    }

    console.log('🍎 Running iOS HealthKit example...');

    const healthService = getHealthService({
      enableBackgroundSync: true,
      syncInterval: 30,
      maxHistoryDays: 365,
      qualityThreshold: 30,
      retryAttempts: 3,
      retryDelay: 5000,
    });

    // Initialize and request permissions
    await healthService.initialize({ enableBackgroundSync: true, syncInterval: 30, maxHistoryDays: 365, deduplicationWindow: 5, qualityThreshold: 30, retryAttempts: 3, retryDelay: 5000 });
    await healthService.requestPermissions({
      sleepAnalysis: true,
      heartRate: true,
      respiratoryRate: true,
      activeEnergyBurned: false,
      stepCount: false,
      distanceWalkingRunning: false,
    });

    // Sync recent data
    const result = await healthService.syncHealthData({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });

    console.log('iOS sync result:', result);
  }

  /**
   * Android Health Connect example
   */
  static async androidExample(): Promise<void> {
    if (HealthServiceFactory.getCurrentPlatform() !== 'android') {
      console.log('❌ This example is only for Android');
      return;
    }

    console.log('🤖 Running Android Health Connect example...');

    const healthService = getHealthService({
      enableBackgroundSync: true,
      syncInterval: 30,
      maxHistoryDays: 365,
      qualityThreshold: 30,
      retryAttempts: 3,
      retryDelay: 5000,
    });

    // Initialize and setup
    await healthService.initialize({ enableBackgroundSync: true, syncInterval: 30, maxHistoryDays: 365, deduplicationWindow: 5, qualityThreshold: 30, retryAttempts: 3, retryDelay: 5000 });
    
    // Enable background sync
    await healthService.enableBackgroundSync({
      enabled: true,
      interval: 60, // 1 hour
      batteryOptimization: true,
      wifiOnly: false,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '07:00',
      },
    });

    console.log('Android Health Connect setup completed');
  }

  /**
   * Web manual entry example
   */
  static async webExample(): Promise<void> {
    if (HealthServiceFactory.getCurrentPlatform() !== 'web') {
      console.log('❌ This example is only for Web');
      return;
    }

    console.log('🌐 Running Web manual entry example...');

    const healthService = getHealthService();
    await healthService.initialize({ enableBackgroundSync: false, syncInterval: 30, maxHistoryDays: 365, deduplicationWindow: 5, qualityThreshold: 30, retryAttempts: 3, retryDelay: 5000 });

    // For web, you would typically provide file import or manual entry capabilities
    console.log('Web health service initialized for manual data entry');
  }
}

/**
 * Example React Hook usage
 */
export const useHealthIntegrationExample = () => {
  const { healthService, platform, capabilities, isSupported } = require('./index').useHealthService();

  const initializeHealth = async () => {
    if (!isSupported) {
      console.warn('Health integration not supported on this platform');
      return false;
    }

    const success = await healthService.initialize({
      enableBackgroundSync: capabilities.supportsBackgroundSync,
      syncInterval: 30,
      maxHistoryDays: 365,
      qualityThreshold: 30,
      retryAttempts: 3,
      retryDelay: 5000,
    });

    if (success && capabilities.requiresPermissions) {
      await healthService.requestPermissions({
        sleepAnalysis: true,
        heartRate: true,
        respiratoryRate: true,
        activeEnergyBurned: false,
        stepCount: false,
        distanceWalkingRunning: false,
      });
    }

    return success;
  };

  const syncHealthData = async () => {
    return await healthService.syncHealthData();
  };

  const getHealthStatus = async () => {
    return {
      syncStatus: await healthService.getSyncStatus(),
      permissions: await healthService.checkPermissions(),
      devices: await healthService.getConnectedDevices(),
      qualityMetrics: await healthService.getDataQualityMetrics(),
    };
  };

  return {
    platform,
    capabilities,
    isSupported,
    initializeHealth,
    syncHealthData,
    getHealthStatus,
  };
};

// Export examples for easy usage
export default {
  HealthIntegrationExample,
  SimplePlatformExamples,
  useHealthIntegrationExample,
};