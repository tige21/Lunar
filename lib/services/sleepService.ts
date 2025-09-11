/**
 * Sleep Data Service
 * Handles fetching, caching and processing sleep data from various sources including HealthKit
 */

import { HealthKitAdapter } from '@/lib/adapters/healthKitAdapter';
import { SleepSession } from '@/types/sleep';

export interface SleepData {
  score: number;
  duration: string;
  efficiency: number;
  timeToFallAsleep: number;
  awakenings: number;
  phases: {
    deep: number;
    rem: number;
    light: number;
    wake: number;
  };
  streak: number;
  weekTrend: number[];
  lastUpdated: Date;
}

export interface SleepServiceError {
  code: 'NETWORK_ERROR' | 'PERMISSION_DENIED' | 'NO_DATA' | 'PARSING_ERROR';
  message: string;
}

export class SleepService {
  private static instance: SleepService;
  private cache: Map<string, { data: SleepData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private healthKitAdapter: HealthKitAdapter;
  private isHealthKitEnabled: boolean = false;

  constructor() {
    this.healthKitAdapter = new HealthKitAdapter();
    this.initializeHealthKit();
    
    // Debug test for development
    if (__DEV__) {
      setTimeout(() => {
        this.healthKitAdapter.debugTest();
      }, 2000);
    }
  }

  static getInstance(): SleepService {
    if (!SleepService.instance) {
      SleepService.instance = new SleepService();
    }
    return SleepService.instance;
  }

  /**
   * Initialize HealthKit integration
   */
  private async initializeHealthKit(): Promise<void> {
    try {
      const isAvailable = await this.healthKitAdapter.isHealthKitAvailable();
      console.log('HealthKit availability check:', isAvailable);
      
      if (isAvailable) {
        const authStatus = await this.healthKitAdapter.getAuthorizationStatus();
        console.log('HealthKit authorization status:', authStatus);
        
        this.isHealthKitEnabled = authStatus.authorizationStatus === 'sharingAuthorized';
        console.log('HealthKit initialization:', this.isHealthKitEnabled ? 'enabled' : 'disabled');
        
        // If HealthKit is available but not authorized, we can ask for permissions later
        if (!this.isHealthKitEnabled && authStatus.authorizationStatus === 'notDetermined') {
          console.log('HealthKit permissions not determined - can request later');
        }
      } else {
        console.log('HealthKit not available on this device');
      }
    } catch (error) {
      console.error('HealthKit initialization failed:', error);
      this.isHealthKitEnabled = false;
    }
  }

  /**
   * Get current sleep data with caching
   */
  async getCurrentSleepData(): Promise<SleepData | null> {
    const cacheKey = 'current_sleep_data';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // In a real app, this would fetch from:
      // 1. HealthKit (iOS) / Google Fit (Android)
      // 2. Local SQLite database
      // 3. Wearable devices (Apple Watch, Fitbit, etc.)
      const data = await this.fetchFromHealthKit();
      
      if (data) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      return null;
    }
  }

  /**
   * Calculate sleep score based on multiple factors
   */
  calculateSleepScore(sleepData: Partial<SleepData>): number {
    const {
      efficiency = 0,
      timeToFallAsleep = 60,
      awakenings = 10,
      phases = { deep: 0, rem: 0, light: 0, wake: 0 }
    } = sleepData;

    let score = 0;

    // Sleep efficiency (0-30 points)
    score += Math.min(30, (efficiency / 100) * 30);

    // Time to fall asleep (0-20 points)
    const fallAsleepScore = Math.max(0, 20 - (timeToFallAsleep - 5) * 0.5);
    score += Math.min(20, fallAsleepScore);

    // Awakenings (0-20 points)
    const awakeningsScore = Math.max(0, 20 - awakenings * 2);
    score += Math.min(20, awakeningsScore);

    // Sleep phases balance (0-30 points)
    const idealDeep = 25; // 20-25% deep sleep is ideal
    const idealRem = 22; // 20-25% REM sleep is ideal
    
    const deepScore = Math.max(0, 15 - Math.abs(phases.deep - idealDeep));
    const remScore = Math.max(0, 15 - Math.abs(phases.rem - idealRem));
    score += deepScore + remScore;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Get sleep quality description
   */
  getSleepQuality(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Get personalized insights based on sleep data
   */
  getInsights(sleepData: SleepData): string[] {
    const insights: string[] = [];

    if (sleepData.efficiency < 85) {
      insights.push('Try to maintain a consistent bedtime routine to improve sleep efficiency.');
    }

    if (sleepData.timeToFallAsleep > 20) {
      insights.push('Consider relaxation techniques before bed to fall asleep faster.');
    }

    if (sleepData.phases.deep < 20) {
      insights.push('Your deep sleep is below optimal. Avoid caffeine 6 hours before bedtime.');
    }

    if (sleepData.phases.rem < 18) {
      insights.push('REM sleep supports memory and mood. Try to get 7-9 hours of total sleep.');
    }

    if (sleepData.awakenings > 3) {
      insights.push('Multiple awakenings detected. Check your sleep environment for noise or light.');
    }

    return insights;
  }

  /**
   * Request HealthKit permissions
   */
  async requestHealthKitPermissions(): Promise<boolean> {
    try {
      const granted = await this.healthKitAdapter.requestPermissions();
      this.isHealthKitEnabled = granted;
      return granted;
    } catch (error) {
      console.error('Failed to request HealthKit permissions:', error);
      return false;
    }
  }

  /**
   * Get HealthKit authorization status
   */
  async getHealthKitStatus(): Promise<any> {
    try {
      return await this.healthKitAdapter.getAuthorizationStatus();
    } catch (error) {
      console.error('Failed to get HealthKit status:', error);
      return {
        isAvailable: false,
        authorizationStatus: 'sharingDenied',
        permissions: {},
      };
    }
  }

  /**
   * Sync sleep data from HealthKit
   */
  async syncFromHealthKit(days: number = 1): Promise<SleepData | null> {
    console.log('🔄 Starting HealthKit sync for', days, 'days');
    
    // Check if HealthKit is available
    const isAvailable = await this.healthKitAdapter.isHealthKitAvailable();
    if (!isAvailable) {
      console.log('❌ HealthKit not available on this device, using mock data');
      return this.generateMockData();
    }

    // Check authorization status
    const authStatus = await this.healthKitAdapter.getAuthorizationStatus();
    console.log('🔐 HealthKit authorization status:', authStatus.authorizationStatus);
    
    if (authStatus.authorizationStatus !== 'sharingAuthorized') {
      console.log('⚠️ HealthKit not authorized, trying to request permissions');
      
      // Try to request permissions automatically
      const granted = await this.requestHealthKitPermissions();
      if (!granted) {
        console.log('❌ HealthKit permissions denied, using mock data');
        return this.generateMockData();
      }
      
      // Update our internal state
      this.isHealthKitEnabled = true;
      console.log('✅ HealthKit permissions granted');
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      console.log('📅 Fetching HealthKit data from', startDate.toISOString(), 'to', endDate.toISOString());

      // Fetch sleep data from HealthKit
      console.log('💤 Fetching sleep data...');
      const sleepData = await this.healthKitAdapter.fetchSleepData(startDate, endDate);
      console.log('💤 Found', sleepData?.length || 0, 'sleep records');

      console.log('❤️ Fetching heart rate data...');
      const heartRateData = await this.healthKitAdapter.fetchHeartRateData(startDate, endDate);
      console.log('❤️ Found', heartRateData?.length || 0, 'heart rate records');

      console.log('📊 Fetching HRV data...');
      const hrvData = await this.healthKitAdapter.fetchHRVData(startDate, endDate);
      console.log('📊 Found', hrvData?.length || 0, 'HRV records');

      if (!sleepData || sleepData.length === 0) {
        console.warn('⚠️ No HealthKit sleep data found, using mock data');
        return this.generateMockData();
      }

      // Transform HealthKit data to our format
      console.log('🔄 Transforming HealthKit data to app format...');
      const sleepSession = this.healthKitAdapter.transformToSleepSession({
        healthKitData: sleepData,
        heartRateData,
        hrvData,
      });

      if (!sleepSession) {
        console.warn('❌ Failed to transform HealthKit data, using mock data');
        return this.generateMockData();
      }

      console.log('✅ Successfully transformed HealthKit data');
      console.log('📊 Sleep session:', {
        duration: sleepSession.duration,
        efficiency: sleepSession.quality?.efficiency,
        stages: sleepSession.stages.length
      });

      // Convert SleepSession to SleepData format
      const result = this.transformSleepSessionToSleepData(sleepSession);
      console.log('✅ HealthKit sync completed successfully');
      return result;
    } catch (error) {
      console.error('❌ HealthKit sync failed:', error);
      return this.generateMockData();
    }
  }

  /**
   * Fetch sleep data from HealthKit or fallback to mock data
   */
  private async fetchFromHealthKit(): Promise<SleepData | null> {
    return await this.syncFromHealthKit();
  }

  /**
   * Transform SleepSession to SleepData format
   */
  private transformSleepSessionToSleepData(session: SleepSession): SleepData {
    // Calculate sleep phases percentages
    const totalDuration = session.duration;
    const phases = {
      deep: 0,
      rem: 0,
      light: 0,
      wake: 0,
    };

    // Calculate phase percentages from stages
    session.stages.forEach(stage => {
      const percentage = (stage.duration / totalDuration) * 100;
      // Map 'awake' to 'wake' for consistency
      const phaseKey = stage.stage === 'awake' ? 'wake' : stage.stage;
      if (phaseKey in phases) {
        phases[phaseKey as keyof typeof phases] += percentage;
      }
    });

    // Calculate awakenings from stages
    const awakenings = session.stages.filter(stage => stage.stage === 'awake').length;

    // Estimate time to fall asleep (first 30 minutes)
    const firstStage = session.stages[0];
    const timeToFallAsleep = firstStage && firstStage.stage === 'awake' 
      ? Math.min(30, firstStage.duration) 
      : 5; // Default if no awake stage at start

    const sleepData: SleepData = {
      score: session.quality?.overall * 10 || 0, // Convert 1-10 scale to 0-100
      duration: this.formatDuration(session.duration),
      efficiency: session.quality?.efficiency || 85,
      timeToFallAsleep,
      awakenings,
      phases: {
        deep: Math.round(phases.deep),
        rem: Math.round(phases.rem),
        light: Math.round(phases.light),
        wake: Math.round(phases.wake),
      },
      streak: Math.floor(Math.random() * 14) + 1, // TODO: Calculate real streak
      weekTrend: Array.from({ length: 7 }, () => 60 + Math.random() * 35).map(Math.round), // TODO: Get real trend
      lastUpdated: session.updatedAt,
    };

    // Recalculate score with our algorithm
    sleepData.score = this.calculateSleepScore(sleepData);

    return sleepData;
  }

  /**
   * Generate mock data as fallback
   */
  private async generateMockData(): Promise<SleepData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Generate realistic mock data
    const efficiency = 75 + Math.random() * 20; // 75-95%
    const timeToFallAsleep = 5 + Math.random() * 25; // 5-30 minutes
    const awakenings = Math.floor(Math.random() * 5); // 0-4 awakenings
    
    const phases = {
      deep: 18 + Math.random() * 12, // 18-30%
      rem: 16 + Math.random() * 12, // 16-28%
      light: 45 + Math.random() * 10, // 45-55%
      wake: 2 + Math.random() * 6 // 2-8%
    };

    // Normalize phases to 100%
    const total = Object.values(phases).reduce((sum, val) => sum + val, 0);
    Object.keys(phases).forEach(key => {
      phases[key as keyof typeof phases] = Math.round((phases[key as keyof typeof phases] / total) * 100);
    });

    const sleepData: SleepData = {
      score: 0, // Will be calculated
      duration: this.formatDuration(420 + Math.random() * 180), // 7-10 hours
      efficiency: Math.round(efficiency),
      timeToFallAsleep: Math.round(timeToFallAsleep),
      awakenings,
      phases,
      streak: Math.floor(Math.random() * 14) + 1, // 1-14 days
      weekTrend: Array.from({ length: 7 }, () => 60 + Math.random() * 35).map(Math.round),
      lastUpdated: new Date()
    };

    // Calculate score
    sleepData.score = this.calculateSleepScore(sleepData);

    return sleepData;
  }

  /**
   * Format sleep duration from minutes to readable string
   */
  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default SleepService.getInstance();