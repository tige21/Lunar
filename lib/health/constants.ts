/**
 * Health Integration Constants for Lunar Sleep Analysis App
 * Platform-specific constants and configuration values
 */

import { HealthServiceConfig, SleepStageMapping, DataSourcePriority } from './types';

// Default health service configuration
export const DEFAULT_HEALTH_CONFIG: HealthServiceConfig = {
  enableBackgroundSync: true,
  syncInterval: 30, // 30 minutes
  maxHistoryDays: 730, // 2 years as specified in PRD
  deduplicationWindow: 5, // 5 minutes
  qualityThreshold: 30, // minimum 30 minutes for valid sleep session
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
};

// HealthKit to Lunar sleep stage mapping
export const HEALTHKIT_STAGE_MAPPING: SleepStageMapping = {
  'awake': 'awake',
  'rem': 'rem',
  'core': 'light', // HealthKit 'core' maps to our 'light' sleep
  'deep': 'deep',
  'unspecified': 'light', // Default unspecified to light sleep
};

// Data source priority (higher number = higher priority)
export const DATA_SOURCE_PRIORITY: DataSourcePriority = {
  // Apple Watch has highest priority for sleep tracking
  'com.apple.health.watch': 100,
  // Native Apple Health app
  'com.apple.Health': 90,
  // Third-party apps with known reliability
  'com.apple.sleep': 85,
  'com.oura.ring': 80,
  'com.fitbit.fitness': 75,
  'com.garmin.connect': 75,
  'com.whoop.app': 75,
  // Other third-party apps
  'com.sleepwatch.app': 70,
  'com.pillow.app': 70,
  'com.sleep.cycle': 65,
  // Manual entries get lower priority
  'manual_entry': 50,
  // Unknown sources get lowest priority
  'unknown': 10,
};

// HealthKit data types
export const HEALTHKIT_TYPES = {
  SLEEP_ANALYSIS: 'HKCategoryTypeIdentifierSleepAnalysis',
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  HEART_RATE_VARIABILITY: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  RESPIRATORY_RATE: 'HKQuantityTypeIdentifierRespiratoryRate',
  RESTING_HEART_RATE: 'HKQuantityTypeIdentifierRestingHeartRate',
  STEP_COUNT: 'HKQuantityTypeIdentifierStepCount',
  ACTIVE_ENERGY: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  DISTANCE_WALKING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
} as const;

// Health Connect data types (Android)
export const HEALTH_CONNECT_TYPES = {
  SLEEP_SESSION: 'SleepSession',
  SLEEP_STAGE: 'SleepStage',
  HEART_RATE: 'HeartRate',
  HEART_RATE_VARIABILITY: 'HeartRateVariabilityRmssd',
  RESPIRATORY_RATE: 'RespiratoryRate',
  RESTING_HEART_RATE: 'RestingHeartRate',
  STEPS: 'Steps',
  ACTIVE_CALORIES: 'ActiveCaloriesBurned',
  DISTANCE: 'Distance',
} as const;

// Sleep quality calculation weights
export const SLEEP_QUALITY_WEIGHTS = {
  duration: 0.25,
  efficiency: 0.30,
  deepSleepPercentage: 0.20,
  remSleepPercentage: 0.15,
  heartRateStability: 0.10,
};

// Optimal sleep stage percentages (used for quality scoring)
export const OPTIMAL_SLEEP_STAGES = {
  deep: { min: 13, max: 23, optimal: 18 }, // % of total sleep
  rem: { min: 20, max: 25, optimal: 22 }, // % of total sleep
  light: { min: 45, max: 55, optimal: 50 }, // % of total sleep
  awake: { min: 0, max: 10, optimal: 5 }, // % of total sleep
};

// Heart rate zones (BPM) for sleep analysis
export const HEART_RATE_ZONES = {
  resting: { min: 40, max: 100 },
  deep_sleep: { min: 40, max: 65 },
  light_sleep: { min: 50, max: 75 },
  rem_sleep: { min: 55, max: 80 },
  awake: { min: 60, max: 120 },
};

// Data validation thresholds
export const VALIDATION_THRESHOLDS = {
  // Session duration limits (in minutes)
  minSessionDuration: 30,
  maxSessionDuration: 16 * 60, // 16 hours
  
  // Heart rate limits (BPM)
  minHeartRate: 30,
  maxHeartRate: 200,
  
  // Respiratory rate limits (breaths per minute)
  minRespiratoryRate: 8,
  maxRespiratoryRate: 30,
  
  // Sleep efficiency limits (percentage)
  minSleepEfficiency: 0,
  maxSleepEfficiency: 100,
  
  // Time gap thresholds
  maxGapBetweenStages: 30, // minutes
  maxOverlapBetweenSessions: 15, // minutes
};

// Sync error retry configuration
export const SYNC_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'network_error',
    'timeout',
    'rate_limit',
    'temporary_unavailable',
    'permission_temporarily_denied',
  ],
};

// Background sync configuration
export const BACKGROUND_SYNC_CONFIG = {
  minInterval: 15, // minimum 15 minutes
  maxInterval: 6 * 60, // maximum 6 hours
  defaultInterval: 30, // default 30 minutes
  batteryOptimizedInterval: 60, // 1 hour when battery optimization is enabled
  quietHours: {
    default: {
      start: '22:00',
      end: '07:00',
    },
  },
};

// Data compression settings
export const COMPRESSION_CONFIG = {
  enableCompression: true,
  compressionLevel: 6, // 0-9 scale
  compressionThreshold: 1024, // compress data larger than 1KB
  archiveAfterDays: 90,
  deleteAfterDays: 730, // 2 years
};

// Privacy settings
export const PRIVACY_CONFIG = {
  encryptionAlgorithm: 'AES-256-GCM',
  keyDerivationIterations: 100000,
  saltLength: 32,
  dataAnonymizationLevel: 'medium', // low, medium, high
  allowTelemetry: false,
  allowCrashReporting: true,
};

// Platform-specific permissions
export const IOS_PERMISSIONS = [
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
  'HKQuantityTypeIdentifierRespiratoryRate',
  'HKQuantityTypeIdentifierRestingHeartRate',
] as const;

export const ANDROID_PERMISSIONS = [
  'android.permission.health.READ_SLEEP',
  'android.permission.health.READ_HEART_RATE',
  'android.permission.health.READ_RESPIRATORY_RATE',
  'android.permission.health.READ_STEPS',
  'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
] as const;

// Error codes and messages
export const HEALTH_ERROR_CODES = {
  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_RESTRICTED: 'PERMISSION_RESTRICTED',
  
  // Data errors
  NO_DATA_AVAILABLE: 'NO_DATA_AVAILABLE',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  DATA_TOO_OLD: 'DATA_TOO_OLD',
  DUPLICATE_DATA: 'DUPLICATE_DATA',
  
  // Sync errors
  SYNC_IN_PROGRESS: 'SYNC_IN_PROGRESS',
  SYNC_FAILED: 'SYNC_FAILED',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Service errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
  CONFIGURATION_INVALID: 'CONFIGURATION_INVALID',
  
  // Platform errors
  HEALTHKIT_UNAVAILABLE: 'HEALTHKIT_UNAVAILABLE',
  HEALTH_CONNECT_UNAVAILABLE: 'HEALTH_CONNECT_UNAVAILABLE',
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
} as const;

export const HEALTH_ERROR_MESSAGES = {
  [HEALTH_ERROR_CODES.PERMISSION_DENIED]: 'Health data access permission denied',
  [HEALTH_ERROR_CODES.PERMISSION_RESTRICTED]: 'Health data access is restricted',
  [HEALTH_ERROR_CODES.NO_DATA_AVAILABLE]: 'No health data available for the specified period',
  [HEALTH_ERROR_CODES.INVALID_DATA_FORMAT]: 'Health data is in an invalid format',
  [HEALTH_ERROR_CODES.DATA_TOO_OLD]: 'Health data is older than the maximum allowed age',
  [HEALTH_ERROR_CODES.DUPLICATE_DATA]: 'Duplicate health data detected',
  [HEALTH_ERROR_CODES.SYNC_IN_PROGRESS]: 'Health data sync is already in progress',
  [HEALTH_ERROR_CODES.SYNC_FAILED]: 'Health data sync failed',
  [HEALTH_ERROR_CODES.NETWORK_UNAVAILABLE]: 'Network connection unavailable',
  [HEALTH_ERROR_CODES.RATE_LIMITED]: 'Health data access rate limited',
  [HEALTH_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Health service is unavailable',
  [HEALTH_ERROR_CODES.INITIALIZATION_FAILED]: 'Health service initialization failed',
  [HEALTH_ERROR_CODES.CONFIGURATION_INVALID]: 'Health service configuration is invalid',
  [HEALTH_ERROR_CODES.HEALTHKIT_UNAVAILABLE]: 'HealthKit is not available on this device',
  [HEALTH_ERROR_CODES.HEALTH_CONNECT_UNAVAILABLE]: 'Health Connect is not available',
  [HEALTH_ERROR_CODES.UNSUPPORTED_PLATFORM]: 'Health integration not supported on this platform',
} as const;

// Device capability detection
export const DEVICE_CAPABILITIES = {
  ios: {
    requiresAppleWatch: false,
    supportsBackgroundDelivery: true,
    supportsHealthKit: true,
    supportsContinuousHeartRate: true,
    supportsRespiratoryRate: true,
  },
  android: {
    requiresWearOS: false,
    supportsHealthConnect: true,
    supportsGoogleFit: true,
    supportsContinuousHeartRate: true,
    supportsRespiratoryRate: true,
  },
  web: {
    supportsHealthAPI: false,
    supportsManualEntry: true,
    supportsDataImport: true,
    supportsContinuousHeartRate: false,
    supportsRespiratoryRate: false,
  },
};

// Sleep score calculation constants
export const SLEEP_SCORE_FACTORS = {
  // Duration score factors
  optimalDuration: 8 * 60, // 8 hours in minutes
  minAcceptableDuration: 6 * 60, // 6 hours
  maxAcceptableDuration: 10 * 60, // 10 hours
  
  // Efficiency score factors
  optimalEfficiency: 90, // 90%
  goodEfficiency: 85, // 85%
  acceptableEfficiency: 80, // 80%
  
  // Consistency score factors
  optimalBedtimeVariation: 30, // 30 minutes
  acceptableBedtimeVariation: 60, // 1 hour
  
  // Restfulness score factors
  maxOptimalAwakenings: 2,
  maxAcceptableAwakenings: 4,
  optimalAwakeTime: 5, // 5 minutes total awake time
  acceptableAwakeTime: 15, // 15 minutes total awake time
};

// Analytics and insights configuration
export const INSIGHTS_CONFIG = {
  minDataPointsForPattern: 7, // minimum sessions to identify patterns
  confidenceThreshold: 0.7, // minimum confidence for actionable insights
  insightRetentionDays: 30, // how long to keep insights
  maxInsightsPerType: 5, // maximum insights per type to show
  analysisWindowDays: 14, // analysis window for pattern detection
};

// Export format configurations
export const EXPORT_FORMATS = {
  json: {
    extension: '.json',
    mimeType: 'application/json',
    includeMetadata: true,
    compress: true,
  },
  csv: {
    extension: '.csv',
    mimeType: 'text/csv',
    includeHeaders: true,
    dateFormat: 'ISO',
  },
  healthkit: {
    extension: '.xml',
    mimeType: 'application/xml',
    includeMetadata: true,
    validateSchema: true,
  },
};