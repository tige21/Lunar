/**
 * HealthKit Service
 * Handles integration with iOS HealthKit and Android Health Connect
 * Mobile-optimized with haptic feedback and proper error handling
 */

import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export interface HealthPermissions {
  sleep: boolean;
  heartRate: boolean;
  steps: boolean;
  workout: boolean;
  oxygenSaturation?: boolean;
  bodyTemperature?: boolean;
}

export interface SleepSample {
  startDate: Date;
  endDate: Date;
  value: 'inBed' | 'asleep' | 'awake';
  sourceName?: string;
  sourceVersion?: string;
}

export interface HeartRateSample {
  startDate: Date;
  endDate: Date;
  value: number;
}

export class HealthKitService {
  private static instance: HealthKitService;
  private isInitialized = false;
  private permissionCache: HealthPermissions | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  /**
   * Check if HealthKit is available
   */
  isAvailable(): boolean {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    // Check if running on physical device
    if (__DEV__ && Constants.platform?.ios?.simulator) {
      console.log('HealthKit not available on iOS Simulator');
      return false;
    }
    
    return true;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      if (!this.isAvailable()) {
        console.log('HealthKit not available on this platform');
        return;
      }

      // In production: await AppleHealthKit.initHealthKit(permissions);
      console.log('HealthKit service initialized (mock)');
      this.isInitialized = true;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to initialize HealthKit:', error);
      throw error;
    }
  }

  /**
   * Request permissions for health data access with haptic feedback
   */
  async requestPermissions(): Promise<HealthPermissions> {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      let permissions: HealthPermissions;
      
      if (Platform.OS === 'ios') {
        permissions = await this.requestIOSPermissions();
      } else {
        permissions = await this.requestAndroidPermissions();
      }
      
      // Cache the permissions
      this.permissionCache = permissions;
      this.lastCacheTime = Date.now();
      
      // Provide feedback based on permissions granted
      const allGranted = Object.values(permissions).every(Boolean);
      if (allGranted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
      return permissions;
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  /**
   * Check if permissions are granted (with caching)
   */
  async checkPermissions(): Promise<HealthPermissions> {
    // Return cached permissions if still valid
    if (this.permissionCache && Date.now() - this.lastCacheTime < this.CACHE_DURATION) {
      return this.permissionCache;
    }
    
    try {
      // In production: const status = await AppleHealthKit.getAuthorizationStatus();
      const permissions: HealthPermissions = {
        sleep: true,
        heartRate: Math.random() > 0.5, // Simulate partial permissions
        steps: true,
        workout: Math.random() > 0.3,
        oxygenSaturation: Math.random() > 0.7,
        bodyTemperature: Math.random() > 0.8
      };
      
      this.permissionCache = permissions;
      this.lastCacheTime = Date.now();
      
      return permissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      // Return default permissions on error
      return {
        sleep: false,
        heartRate: false,
        steps: false,
        workout: false
      };
    }
  }

  /**
   * Fetch sleep data from HealthKit/Health Connect
   */
  async fetchSleepData(startDate: Date, endDate: Date): Promise<SleepSample[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const permissions = await this.checkPermissions();
      if (!permissions.sleep) {
        throw new Error('Sleep data permission not granted');
      }
      
      // In production: const data = await AppleHealthKit.getSleepSamples({startDate, endDate});
      
      // Mock data for development
      const mockData: SleepSample[] = [
        {
          startDate: new Date(startDate.getTime() + 22 * 60 * 60 * 1000), // 10 PM
          endDate: new Date(startDate.getTime() + 23 * 60 * 60 * 1000), // 11 PM
          value: 'inBed',
          sourceName: 'iPhone',
          sourceVersion: '17.0'
        },
        {
          startDate: new Date(startDate.getTime() + 23 * 60 * 60 * 1000), // 11 PM
          endDate: new Date(startDate.getTime() + 30 * 60 * 60 * 1000), // 6 AM next day
          value: 'asleep',
          sourceName: 'iPhone',
          sourceVersion: '17.0'
        }
      ];
      
      return mockData;
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  }

  /**
   * Write sleep data to HealthKit/Health Connect with haptic feedback
   */
  async writeSleepData(sleepData: SleepSample[]): Promise<boolean> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions.sleep) {
        throw new Error('Sleep data write permission not granted');
      }
      
      // In production: await AppleHealthKit.saveSleepSample(sleepData);
      console.log('Writing sleep data to HealthKit (mock):', sleepData);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch (error) {
      console.error('Error writing sleep data:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
  }
  
  /**
   * Fetch heart rate data
   */
  async fetchHeartRateData(startDate: Date, endDate: Date): Promise<HeartRateSample[]> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions.heartRate) {
        throw new Error('Heart rate permission not granted');
      }
      
      // Mock data for development
      const mockData: HeartRateSample[] = [];
      const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      
      for (let i = 0; i < hours * 4; i++) { // Every 15 minutes
        const time = new Date(startDate.getTime() + i * 15 * 60 * 1000);
        const hour = time.getHours();
        
        // Realistic heart rate patterns
        let baseRate = 65;
        if (hour >= 23 || hour <= 6) {
          baseRate = 55; // Sleep
        } else if (hour >= 7 && hour <= 9) {
          baseRate = 75; // Morning
        }
        
        const heartRate = baseRate + (Math.random() - 0.5) * 15;
        
        mockData.push({
          startDate: time,
          endDate: new Date(time.getTime() + 15 * 60 * 1000),
          value: Math.round(Math.max(45, Math.min(120, heartRate)))
        });
      }
      
      return mockData;
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      return [];
    }
  }

  private async requestIOSPermissions(): Promise<HealthPermissions> {
    try {
      // In production, use AppleHealthKit.requestPermissions
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async request
      
      return {
        sleep: true,
        heartRate: true,
        steps: true,
        workout: true,
        oxygenSaturation: true,
        bodyTemperature: false // Some permissions might be denied
      };
    } catch (error) {
      console.error('Error requesting iOS permissions:', error);
      return {
        sleep: false,
        heartRate: false,
        steps: false,
        workout: false
      };
    }
  }

  private async requestAndroidPermissions(): Promise<HealthPermissions> {
    try {
      // In production, use Health Connect API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        sleep: true,
        heartRate: false, // Often requires special approval
        steps: true,
        workout: true,
        oxygenSaturation: false,
        bodyTemperature: false
      };
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return {
        sleep: false,
        heartRate: false,
        steps: false,
        workout: false
      };
    }
  }
  
  /**
   * Clear cached data
   */
  clearCache(): void {
    this.permissionCache = null;
    this.lastCacheTime = 0;
  }
  
  /**
   * Get service status
   */
  getStatus(): {
    available: boolean;
    initialized: boolean;
    hasCachedPermissions: boolean;
  } {
    return {
      available: this.isAvailable(),
      initialized: this.isInitialized,
      hasCachedPermissions: this.permissionCache !== null
    };
  }
}

export default HealthKitService.getInstance();