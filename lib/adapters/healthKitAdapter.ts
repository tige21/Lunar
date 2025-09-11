import { Platform } from 'react-native';
import {
  HealthKitAuthStatus,
  HealthKitConfig,
  HealthKitError,
  HealthKitHeartRateData,
  HealthKitHRVData,
  HealthKitIdentifiers,
  HealthKitSleepData,
  HealthKitToSleepSessionTransform
} from '../../types/healthKit';
import { HeartRateData, SleepSession, SleepStage } from '../../types/sleep';

// Импорт react-native-health только для iOS
let AppleHealthKit: any = null;
if (Platform.OS === 'ios') {
  try {
    AppleHealthKit = require('react-native-health').default;
  } catch (error) {
    console.warn('HealthKit not available:', error);
  }
}

export class HealthKitAdapter {
  private isInitialized = false;
  private authStatus: HealthKitAuthStatus | null = null;

  // Конфигурация разрешений для HealthKit
  private readonly config: HealthKitConfig = {
    permissions: {
      read: [
        { identifier: HealthKitIdentifiers.SLEEP_ANALYSIS, type: 'category' },
        { identifier: HealthKitIdentifiers.HEART_RATE, type: 'quantity' },
        { identifier: HealthKitIdentifiers.HEART_RATE_VARIABILITY, type: 'quantity' },
        { identifier: HealthKitIdentifiers.RESTING_HEART_RATE, type: 'quantity' },
        { identifier: HealthKitIdentifiers.RESPIRATORY_RATE, type: 'quantity' },
      ],
      write: [
        { identifier: HealthKitIdentifiers.SLEEP_ANALYSIS, type: 'category' },
      ],
    },
    enableBackgroundDelivery: true,
    backgroundDeliveryFrequency: 'hourly',
  };

  constructor() {
    this.initialize();
    console.log('🏗️ HealthKitAdapter initialized');
  }

  /**
   * Debug method to test HealthKit initialization
   */
  async debugTest(): Promise<void> {
    console.log('🧪 DEBUG: Starting HealthKit test...');
    console.log('🧪 DEBUG: Platform:', Platform.OS);
    console.log('🧪 DEBUG: AppleHealthKit available:', !!AppleHealthKit);
    console.log('🧪 DEBUG: isInitialized:', this.isInitialized);
    
    if (Platform.OS === 'ios' && AppleHealthKit) {
      try {
        console.log('🧪 DEBUG: Testing isAvailable...');
        const isAvailable = await this.isHealthKitAvailable();
        console.log('🧪 DEBUG: HealthKit available:', isAvailable);
        
        if (isAvailable) {
          console.log('🧪 DEBUG: Testing auth status...');
          const authStatus = await this.getAuthorizationStatus();
          console.log('🧪 DEBUG: Auth status:', authStatus);
          
          if (authStatus.authorizationStatus !== 'sharingAuthorized') {
            console.log('🧪 DEBUG: Requesting permissions...');
            const granted = await this.requestPermissions();
            console.log('🧪 DEBUG: Permissions granted:', granted);
          }
        }
      } catch (error) {
        console.error('🧪 DEBUG: Error during test:', error);
      }
    }
  }

  /**
   * Инициализация HealthKit
   */
  private async initialize(): Promise<void> {
    if (Platform.OS !== 'ios' || !AppleHealthKit) {
      console.warn('HealthKit is only available on iOS devices');
      return;
    }

    try {
      const isAvailable = await this.isHealthKitAvailable();
      if (!isAvailable) {
        console.warn('HealthKit is not available on this device');
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize HealthKit:', error);
    }
  }

  /**
   * Проверка доступности HealthKit
   */
  async isHealthKitAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios' || !AppleHealthKit) {
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((error: any, available: boolean) => {
        if (error) {
          console.error('HealthKit availability check failed:', error);
          resolve(false);
          return;
        }
        resolve(available);
      });
    });
  }

  /**
   * Запрос разрешений HealthKit
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isInitialized || !AppleHealthKit) {
      console.error('HealthKit not initialized');
      return false;
    }

    return new Promise((resolve) => {
      // Correct format for react-native-health
      const permissions = {
        permissions: {
          read: [
            'Sleep',
            'SleepAnalysis',
            'HeartRate',
            'RestingHeartRate',
            'HeartRateVariability',
          ],
          write: [
            'SleepAnalysis',
          ],
        },
      };

      console.log('🔐 Requesting HealthKit permissions:', permissions);

      AppleHealthKit.initHealthKit(permissions, (error: HealthKitError) => {
        if (error) {
          console.error('❌ HealthKit permission request failed:', error);
          resolve(false);
          return;
        }

        console.log('✅ HealthKit permissions granted successfully');
        this.updateAuthStatus();
        resolve(true);
      });
    });
  }

  /**
   * Получение статуса авторизации
   */
  async getAuthorizationStatus(): Promise<HealthKitAuthStatus> {
    if (!this.isInitialized || !AppleHealthKit) {
      return {
        isAvailable: false,
        authorizationStatus: 'sharingDenied',
        permissions: {},
      };
    }

    return new Promise((resolve) => {
      // Check permissions for sleep analysis specifically
      const permissions = ['SleepAnalysis'];
      
      AppleHealthKit.getAuthStatus(permissions, (error: any, results: any) => {
        if (error) {
          console.error('❌ Failed to get HealthKit auth status:', error);
          resolve({
            isAvailable: false,
            authorizationStatus: 'sharingDenied',
            permissions: {},
          });
          return;
        }

        console.log('🔐 HealthKit auth status results:', results);

        // In react-native-health, status can be:
        // 0 = not determined, 1 = sharing denied, 2 = sharing authorized
        let authorizationStatus: 'notDetermined' | 'sharingDenied' | 'sharingAuthorized' = 'notDetermined';
        
        if (results && results.permissions && results.permissions.SleepAnalysis !== undefined) {
          const status = results.permissions.SleepAnalysis;
          if (status === 2) {
            authorizationStatus = 'sharingAuthorized';
          } else if (status === 1) {
            authorizationStatus = 'sharingDenied';
          } else {
            authorizationStatus = 'notDetermined';
          }
        }

        const authStatus: HealthKitAuthStatus = {
          isAvailable: true,
          authorizationStatus,
          permissions: results?.permissions || {},
        };

        this.authStatus = authStatus;
        console.log('✅ HealthKit auth status:', authStatus);
        resolve(authStatus);
      });
    });
  }

  /**
   * Обновление статуса авторизации
   */
  private async updateAuthStatus(): Promise<void> {
    this.authStatus = await this.getAuthorizationStatus();
  }

  /**
   * Получение данных о сне из HealthKit
   */
  async fetchSleepData(startDate: Date, endDate: Date): Promise<HealthKitSleepData[]> {
    if (!this.isInitialized || !AppleHealthKit) {
      throw new Error('HealthKit not initialized');
    }

    const authStatus = await this.getAuthorizationStatus();
    if (authStatus.authorizationStatus !== 'sharingAuthorized') {
      throw new Error('HealthKit permissions not granted');
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      AppleHealthKit.getSleepSamples(options, (error: HealthKitError, results: any[]) => {
        if (error) {
          console.error('Failed to fetch sleep data:', error);
          reject(new Error(`HealthKit sleep data fetch failed: ${error.localizedDescription}`));
          return;
        }

        const sleepData: HealthKitSleepData[] = results.map(sample => ({
          identifier: sample.uuid || sample.id,
          startDate: new Date(sample.startDate),
          endDate: new Date(sample.endDate),
          value: {
            sleepAnalysis: this.parseSleepAnalysis(sample),
            timeInBed: sample.value === 0 ? this.calculateDuration(sample.startDate, sample.endDate) : undefined,
            timeAsleep: sample.value === 1 ? this.calculateDuration(sample.startDate, sample.endDate) : undefined,
          },
          metadata: sample.metadata,
          device: sample.device,
          sourceRevision: sample.sourceRevision,
        }));

        resolve(sleepData);
      });
    });
  }

  /**
   * Получение данных пульса из HealthKit
   */
  async fetchHeartRateData(startDate: Date, endDate: Date): Promise<HealthKitHeartRateData[]> {
    if (!this.isInitialized || !AppleHealthKit) {
      throw new Error('HealthKit not initialized');
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1000,
      };

      AppleHealthKit.getHeartRateSamples(options, (error: HealthKitError, results: any[]) => {
        if (error) {
          console.error('Failed to fetch heart rate data:', error);
          reject(new Error(`HealthKit heart rate data fetch failed: ${error.localizedDescription}`));
          return;
        }

        const heartRateData: HealthKitHeartRateData[] = results.map(sample => ({
          identifier: sample.uuid || sample.id,
          startDate: new Date(sample.startDate),
          endDate: new Date(sample.endDate),
          value: sample.value,
          metadata: sample.metadata,
          device: sample.device,
          sourceRevision: sample.sourceRevision,
        }));

        resolve(heartRateData);
      });
    });
  }

  /**
   * Получение данных HRV из HealthKit
   */
  async fetchHRVData(startDate: Date, endDate: Date): Promise<HealthKitHRVData[]> {
    if (!this.isInitialized || !AppleHealthKit) {
      throw new Error('HealthKit not initialized');
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      AppleHealthKit.getHeartRateVariabilitySamples(options, (error: HealthKitError, results: any[]) => {
        if (error) {
          console.error('Failed to fetch HRV data:', error);
          // HRV данные могут быть недоступны, поэтому возвращаем пустой массив
          resolve([]);
          return;
        }

        const hrvData: HealthKitHRVData[] = results.map(sample => ({
          identifier: sample.uuid || sample.id,
          startDate: new Date(sample.startDate),
          endDate: new Date(sample.endDate),
          value: sample.value,
          metadata: sample.metadata,
          device: sample.device,
          sourceRevision: sample.sourceRevision,
        }));

        resolve(hrvData);
      });
    });
  }

  /**
   * Преобразование данных HealthKit в формат SleepSession
   */
  transformToSleepSession(data: HealthKitToSleepSessionTransform): SleepSession | null {
    if (!data.healthKitData || data.healthKitData.length === 0) {
      return null;
    }

    // Находим основную сессию сна
    const mainSleepData = data.healthKitData.find(sample => 
      sample.value.timeAsleep && sample.value.timeAsleep > 0
    ) || data.healthKitData[0];

    if (!mainSleepData) {
      return null;
    }

    const sessionId = `healthkit_${mainSleepData.identifier}`;
    const startTime = mainSleepData.startDate;
    const endTime = mainSleepData.endDate;
    const duration = this.calculateDuration(startTime, endTime);

    // Преобразуем фазы сна
    const stages = this.transformSleepStages(data.healthKitData, sessionId);

    // Преобразуем данные пульса
    const heartRate = data.heartRateData ? this.transformHeartRateData(data.heartRateData) : undefined;

    // Рассчитываем качество сна
    const quality = this.calculateSleepQuality(data);

    const sleepSession: SleepSession = {
      id: sessionId,
      userId: 'current_user', // Будет заменено на реальный ID пользователя
      startTime,
      endTime,
      duration,
      quality,
      stages,
      heartRate,
      notes: 'Импортировано из Apple Health',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return sleepSession;
  }

  /**
   * Запись данных сна в HealthKit
   */
  async writeSleepData(sleepSession: SleepSession): Promise<boolean> {
    if (!this.isInitialized || !AppleHealthKit) {
      console.error('HealthKit not initialized');
      return false;
    }

    return new Promise((resolve) => {
      const sleepData = {
        value: 1, // HKCategoryValueSleepAnalysisAsleep
        startDate: sleepSession.startTime.toISOString(),
        endDate: sleepSession.endTime.toISOString(),
      };

      AppleHealthKit.saveSleepSample(sleepData, (error: HealthKitError) => {
        if (error) {
          console.error('Failed to write sleep data to HealthKit:', error);
          resolve(false);
          return;
        }

        console.log('Sleep data written to HealthKit successfully');
        resolve(true);
      });
    });
  }

  // Вспомогательные методы

  private parseSleepAnalysis(sample: any): any {
    // Парсинг данных анализа сна из HealthKit
    return {
      inBed: sample.value === 0 ? {
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        duration: this.calculateDuration(sample.startDate, sample.endDate),
      } : undefined,
      asleep: sample.value === 1 ? {
        startDate: new Date(sample.startDate),
        endDate: new Date(sample.endDate),
        duration: this.calculateDuration(sample.startDate, sample.endDate),
      } : undefined,
    };
  }

  private calculateDuration(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
  }

  private transformSleepStages(healthKitData: HealthKitSleepData[], sessionId: string): SleepStage[] {
    return healthKitData.map((data, index) => ({
      id: `stage_${data.identifier}_${index}`,
      sessionId,
      stage: this.mapHealthKitStageToLocal(data) as 'awake' | 'light' | 'deep' | 'rem',
      startTime: data.startDate,
      endTime: data.endDate,
      duration: this.calculateDuration(data.startDate, data.endDate),
    }));
  }

  private mapHealthKitStageToLocal(data: HealthKitSleepData): string {
    if (data.value.sleepAnalysis?.awake) return 'awake';
    if (data.value.sleepAnalysis?.core) return 'light';
    if (data.value.sleepAnalysis?.deep) return 'deep';
    if (data.value.sleepAnalysis?.rem) return 'rem';
    return 'light'; // default
  }

  private transformHeartRateData(heartRateData: HealthKitHeartRateData[]): HeartRateData[] {
    return heartRateData.map(data => ({
      timestamp: data.startDate,
      bpm: data.value,
      variability: undefined, // HRV данные обрабатываются отдельно
    }));
  }

  private calculateSleepQuality(data: HealthKitToSleepSessionTransform): any {
    // Базовый расчет качества сна на основе данных HealthKit
    const totalDuration = data.healthKitData.reduce((sum, sample) => {
      return sum + this.calculateDuration(sample.startDate, sample.endDate);
    }, 0);

    const asleepDuration = data.healthKitData
      .filter(sample => sample.value.timeAsleep)
      .reduce((sum, sample) => sum + (sample.value.timeAsleep || 0), 0);

    const efficiency = asleepDuration > 0 ? (asleepDuration / totalDuration) * 100 : 0;

    return {
      overall: Math.min(10, Math.round(efficiency / 10)),
      efficiency,
      restfulness: Math.min(10, Math.round(efficiency / 10)),
    };
  }
}