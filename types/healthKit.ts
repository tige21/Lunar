export interface HealthKitPermissions {
  read: HealthKitPermission[];
  write: HealthKitPermission[];
}

export interface HealthKitPermission {
  identifier: string;
  type: 'quantity' | 'category' | 'characteristic' | 'workout' | 'correlation';
}

export interface HealthKitSleepData {
  identifier: string;
  startDate: Date;
  endDate: Date;
  value: HealthKitSleepValue;
  metadata?: Record<string, any>;
  device?: HealthKitDevice;
  sourceRevision?: HealthKitSourceRevision;
}

export interface HealthKitSleepValue {
  sleepAnalysis?: HealthKitSleepAnalysis;
  timeInBed?: number; // minutes
  timeAsleep?: number; // minutes
}

export interface HealthKitSleepAnalysis {
  inBed?: HealthKitSleepStage;
  asleep?: HealthKitSleepStage;
  awake?: HealthKitSleepStage;
  core?: HealthKitSleepStage; // light sleep
  deep?: HealthKitSleepStage;
  rem?: HealthKitSleepStage;
}

export interface HealthKitSleepStage {
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
}

export interface HealthKitHeartRateData {
  identifier: string;
  startDate: Date;
  endDate: Date;
  value: number; // BPM
  metadata?: Record<string, any>;
  device?: HealthKitDevice;
  sourceRevision?: HealthKitSourceRevision;
}

export interface HealthKitHRVData {
  identifier: string;
  startDate: Date;
  endDate: Date;
  value: number; // RMSSD in milliseconds
  metadata?: Record<string, any>;
  device?: HealthKitDevice;
  sourceRevision?: HealthKitSourceRevision;
}

export interface HealthKitDevice {
  name?: string;
  manufacturer?: string;
  model?: string;
  hardwareVersion?: string;
  firmwareVersion?: string;
  softwareVersion?: string;
  localIdentifier?: string;
}

export interface HealthKitSourceRevision {
  source: HealthKitSource;
  version?: string;
}

export interface HealthKitSource {
  name: string;
  bundleIdentifier: string;
}

export interface HealthKitQuery {
  sampleType: string;
  predicate?: any;
  sortDescriptors?: HealthKitSortDescriptor[];
  limit?: number;
}

export interface HealthKitSortDescriptor {
  key: string;
  ascending: boolean;
}

export interface HealthKitError {
  code: number;
  localizedDescription: string;
  domain: string;
}

export interface HealthKitAuthStatus {
  isAvailable: boolean;
  authorizationStatus: 'notDetermined' | 'sharingDenied' | 'sharingAuthorized';
  permissions: {
    [key: string]: 'notDetermined' | 'denied' | 'authorized';
  };
}

export interface HealthKitConfig {
  permissions: HealthKitPermissions;
  enableBackgroundDelivery?: boolean;
  backgroundDeliveryFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Константы для HealthKit идентификаторов
export const HealthKitIdentifiers = {
  // Sleep Analysis
  SLEEP_ANALYSIS: 'HKCategoryTypeIdentifierSleepAnalysis',
  TIME_IN_BED: 'HKCategoryValueSleepAnalysisInBed',
  ASLEEP: 'HKCategoryValueSleepAnalysisAsleep',
  AWAKE: 'HKCategoryValueSleepAnalysisAwake',
  CORE_SLEEP: 'HKCategoryValueSleepAnalysisAsleepCore',
  DEEP_SLEEP: 'HKCategoryValueSleepAnalysisAsleepDeep',
  REM_SLEEP: 'HKCategoryValueSleepAnalysisAsleepREM',
  
  // Heart Rate
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  HEART_RATE_VARIABILITY: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  RESTING_HEART_RATE: 'HKQuantityTypeIdentifierRestingHeartRate',
  
  // Activity (additional context)
  STEPS: 'HKQuantityTypeIdentifierStepCount',
  ACTIVE_ENERGY: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  
  // Environmental (if available)
  RESPIRATORY_RATE: 'HKQuantityTypeIdentifierRespiratoryRate',
} as const;

// Утилитарные типы для преобразования данных
export interface HealthKitToSleepSessionTransform {
  healthKitData: HealthKitSleepData[];
  heartRateData?: HealthKitHeartRateData[];
  hrvData?: HealthKitHRVData[];
}

export interface SleepSessionToHealthKitTransform {
  sleepSession: import('./sleep').SleepSession;
  writeToHealthKit?: boolean;
}