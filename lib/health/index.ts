/**
 * Health Integration Service Index for Lunar Sleep Analysis App
 * Provides cross-platform health data integration with automatic platform detection
 */

import { Platform } from 'react-native';
import { HealthKitService } from './healthService.ios';
import { HealthConnectService } from './healthService.android';
import { WebHealthService } from './healthService.web';
import { IHealthService, HealthServiceConfig, HealthPlatform } from './types';
import { DEFAULT_HEALTH_CONFIG } from './constants';

export * from './types';
export * from './constants';
export * from './utils';

/**
 * Health Service Factory - Returns appropriate service based on platform
 */
export class HealthServiceFactory {
  private static instance: IHealthService | null = null;

  /**
   * Get platform-appropriate health service instance
   */
  static getInstance(config?: HealthServiceConfig): IHealthService {
    if (!this.instance) {
      this.instance = this.createService(config);
    }
    return this.instance;
  }

  /**
   * Create new health service instance (useful for testing or multiple instances)
   */
  static createService(config?: HealthServiceConfig): IHealthService {
    const platform = this.getCurrentPlatform();
    const serviceConfig = { ...DEFAULT_HEALTH_CONFIG, ...config };

    switch (platform) {
      case 'ios':
        return new HealthKitService();
      case 'android':
        return new HealthConnectService();
      case 'web':
        return new WebHealthService();
      default:
        console.warn(`Unsupported platform: ${platform}, falling back to web service`);
        return new WebHealthService();
    }
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Get current platform
   */
  private static getCurrentPlatform(): HealthPlatform {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    if (Platform.OS === 'web') return 'web';
    
    // Fallback detection for web in React Native Web
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'web';
    }

    return 'web'; // Default fallback
  }

  /**
   * Check if health integration is supported on current platform
   */
  static isSupported(): boolean {
    const platform = this.getCurrentPlatform();
    return ['ios', 'android', 'web'].includes(platform);
  }

  /**
   * Get platform capabilities
   */
  static getPlatformCapabilities() {
    const platform = this.getCurrentPlatform();
    
    switch (platform) {
      case 'ios':
        return {
          hasNativeHealthAPI: true,
          supportsBackgroundSync: true,
          supportsRealTimeData: true,
          supportsDeviceDetection: true,
          supportsAutomaticSync: true,
          requiresPermissions: true,
          supportedDataTypes: [
            'sleep_analysis',
            'heart_rate',
            'heart_rate_variability',
            'respiratory_rate',
            'resting_heart_rate',
            'active_energy',
            'steps',
            'distance',
          ],
        };
      case 'android':
        return {
          hasNativeHealthAPI: true,
          supportsBackgroundSync: true,
          supportsRealTimeData: true,
          supportsDeviceDetection: true,
          supportsAutomaticSync: true,
          requiresPermissions: true,
          supportedDataTypes: [
            'sleep_sessions',
            'sleep_stages',
            'heart_rate',
            'heart_rate_variability',
            'respiratory_rate',
            'active_calories',
            'steps',
            'distance',
          ],
        };
      case 'web':
        return {
          hasNativeHealthAPI: false,
          supportsBackgroundSync: false,
          supportsRealTimeData: false,
          supportsDeviceDetection: false,
          supportsAutomaticSync: false,
          requiresPermissions: false,
          supportedDataTypes: [
            'manual_sleep_entry',
            'file_import',
            'csv_import',
            'json_import',
          ],
        };
      default:
        return {
          hasNativeHealthAPI: false,
          supportsBackgroundSync: false,
          supportsRealTimeData: false,
          supportsDeviceDetection: false,
          supportsAutomaticSync: false,
          requiresPermissions: false,
          supportedDataTypes: [],
        };
    }
  }
}

/**
 * Convenience function to get health service instance
 */
export const getHealthService = (config?: HealthServiceConfig): IHealthService => {
  return HealthServiceFactory.getInstance(config);
};

/**
 * Health Service Manager - Provides high-level health integration management
 */
export class HealthServiceManager {
  private healthService: IHealthService;
  private isInitialized: boolean = false;

  constructor(config?: HealthServiceConfig) {
    this.healthService = HealthServiceFactory.getInstance(config);
  }

  /**
   * Initialize health service with comprehensive setup
   */
  async initialize(config?: HealthServiceConfig): Promise<boolean> {
    try {
      // Initialize the service
      const initResult = await this.healthService.initialize(config || DEFAULT_HEALTH_CONFIG);
      if (!initResult) {
        throw new Error('Health service initialization failed');
      }

      // Request basic permissions
      const permissions = {
        sleepAnalysis: true,
        heartRate: true,
        respiratoryRate: true,
        activeEnergyBurned: false,
        stepCount: false,
        distanceWalkingRunning: false,
      };

      const permissionResult = await this.healthService.requestPermissions(permissions);
      if (!permissionResult) {
        console.warn('Some health permissions were not granted');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Health service manager initialization failed:', error);
      return false;
    }
  }

  /**
   * Perform initial health data sync
   */
  async performInitialSync(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Health service manager not initialized');
    }

    try {
      const result = await this.healthService.syncHealthData({
        validateData: true,
        resolveConflicts: true,
        conflictResolution: [],
        dryRun: false,
      });

      return result.success;
    } catch (error) {
      console.error('Initial health data sync failed:', error);
      return false;
    }
  }

  /**
   * Setup automatic background sync
   */
  async setupBackgroundSync(interval: number = 30): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Health service manager not initialized');
    }

    const capabilities = HealthServiceFactory.getPlatformCapabilities();
    if (!capabilities.supportsBackgroundSync) {
      console.warn('Background sync not supported on this platform');
      return false;
    }

    try {
      const config = {
        enabled: true,
        interval, // minutes
        batteryOptimization: true,
        wifiOnly: false,
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
        },
      };

      return await this.healthService.enableBackgroundSync(config);
    } catch (error) {
      console.error('Failed to setup background sync:', error);
      return false;
    }
  }

  /**
   * Get comprehensive health status
   */
  async getHealthStatus() {
    if (!this.isInitialized) {
      throw new Error('Health service manager not initialized');
    }

    try {
      const [
        syncStatus,
        permissions,
        devices,
        qualityMetrics,
      ] = await Promise.all([
        this.healthService.getSyncStatus(),
        this.healthService.checkPermissions(),
        this.healthService.getConnectedDevices(),
        this.healthService.getDataQualityMetrics(),
      ]);

      return {
        platform: HealthServiceFactory.getCurrentPlatform(),
        capabilities: HealthServiceFactory.getPlatformCapabilities(),
        syncStatus,
        permissions,
        devices,
        qualityMetrics,
        isInitialized: this.isInitialized,
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      throw error;
    }
  }

  /**
   * Get the underlying health service instance
   */
  getHealthService(): IHealthService {
    return this.healthService;
  }

  /**
   * Cleanup health service
   */
  async cleanup(): Promise<void> {
    if (this.healthService) {
      await this.healthService.cleanup();
    }
    this.isInitialized = false;
  }
}

/**
 * React Hook for Health Service (if needed)
 */
export const useHealthService = (config?: HealthServiceConfig) => {
  const healthService = HealthServiceFactory.getInstance(config);
  
  return {
    healthService,
    platform: HealthServiceFactory.getCurrentPlatform(),
    capabilities: HealthServiceFactory.getPlatformCapabilities(),
    isSupported: HealthServiceFactory.isSupported(),
  };
};

// Default export for convenience
export default {
  HealthServiceFactory,
  HealthServiceManager,
  getHealthService,
  useHealthService,
};