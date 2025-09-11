/**
 * Health Integration Types for Lunar Sleep Analysis App
 * Comprehensive types for HealthKit (iOS) and Health Connect (Android) integration
 */

// Platform-specific health data types
export type HealthPlatform = 'ios' | 'android' | 'web';

// Sleep stage types matching HealthKit and Health Connect
export type HealthKitSleepStage = 'awake' | 'rem' | 'core' | 'deep' | 'unspecified';
export type LunarSleepStage = 'awake' | 'light' | 'deep' | 'rem';

// Health data source information
export interface HealthDataSource {
  name: string;
  bundleIdentifier: string;
  version?: string;
  device?: string;
  platform: HealthPlatform;
}

// Raw health data from platform APIs
export interface RawSleepData {
  id: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in minutes
  source: HealthDataSource;
  stage?: HealthKitSleepStage;
  category?: 'inBed' | 'asleep';
  metadata?: Record<string, any>;
}

export interface RawHeartRateData {
  id: string;
  timestamp: Date;
  value: number; // BPM
  source: HealthDataSource;
  metadata?: Record<string, any>;
}

export interface RawRespiratoryRateData {
  id: string;
  timestamp: Date;
  value: number; // breaths per minute
  source: HealthDataSource;
  metadata?: Record<string, any>;
}

// Processed health data ready for database storage
export interface ProcessedSleepSession {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  stages: ProcessedSleepStage[];
  heartRateData?: ProcessedHeartRateData[];
  respiratoryRate?: number;
  source: HealthDataSource;
  quality: {
    overall: number;
    efficiency: number;
    restfulness: number;
  };
}

export interface ProcessedSleepStage {
  stage: LunarSleepStage;
  startTime: Date;
  endTime: Date;
  duration: number;
  sequenceOrder: number;
}

export interface ProcessedHeartRateData {
  timestamp: Date;
  bpm: number;
  variability?: number;
}

// Health permissions and settings
export interface HealthPermissions {
  sleepAnalysis: boolean;
  heartRate: boolean;
  respiratoryRate: boolean;
  activeEnergyBurned: boolean;
  stepCount: boolean;
  distanceWalkingRunning: boolean;
}

export interface HealthKitPermissions extends HealthPermissions {
  appleWatchConnected: boolean;
  backgroundDelivery: boolean;
}

export interface HealthConnectPermissions extends HealthPermissions {
  sleepSession: boolean;
  heartRateVariability: boolean;
}

// Health service configuration
export interface HealthServiceConfig {
  enableBackgroundSync: boolean;
  syncInterval: number; // in minutes
  maxHistoryDays: number;
  deduplicationWindow: number; // in minutes
  qualityThreshold: number; // minimum session duration in minutes
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}

// Health data sync status
export interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime?: Date;
  lastSuccessfulSync?: Date;
  nextScheduledSync?: Date;
  isCurrentlySyncing: boolean;
  errorCount: number;
  lastError?: string;
  permissionsGranted: boolean;
  backgroundSyncEnabled: boolean;
}

// Health data validation
export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number; // 0-1 scale
}

// Health data conflict resolution
export interface DataConflict {
  id: string;
  type: 'overlapping_sessions' | 'duplicate_data' | 'inconsistent_timing';
  existingData: any;
  newData: any;
  recommendedAction: 'keep_existing' | 'replace' | 'merge' | 'manual_review';
  confidence: number;
}

export interface ConflictResolution {
  conflictId: string;
  action: 'keep_existing' | 'replace' | 'merge' | 'skip';
  mergeStrategy?: 'average' | 'prefer_newer' | 'prefer_longer' | 'prefer_higher_quality';
}

// Health data import/export
export interface HealthDataImportOptions {
  startDate?: Date;
  endDate?: Date;
  includeSources?: string[];
  excludeSources?: string[];
  validateData: boolean;
  resolveConflicts: boolean;
  conflictResolution: ConflictResolution[];
  dryRun: boolean;
}

export interface HealthDataImportResult {
  success: boolean;
  sessionsImported: number;
  sessionsSkipped: number;
  conflictsFound: number;
  conflictsResolved: number;
  errors: string[];
  warnings: string[];
  processingTime: number; // in milliseconds
}

// Health data export
export interface HealthDataExportOptions {
  format: 'json' | 'csv' | 'healthkit';
  startDate?: Date;
  endDate?: Date;
  includeSources?: string[];
  includeRawData: boolean;
  anonymize: boolean;
}

export interface HealthDataExportResult {
  success: boolean;
  filePath?: string;
  recordCount: number;
  fileSize: number; // in bytes
  checksum: string;
  exportTime: Date;
}

// Health insights and analysis
export interface HealthInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  dataSource: HealthDataSource[];
  relatedSessions: string[];
  createdAt: Date;
  expiresAt?: Date;
}

// Health device integration
export interface HealthDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'fitbit' | 'garmin' | 'oura' | 'whoop' | 'other';
  manufacturer: string;
  model: string;
  isConnected: boolean;
  lastSyncTime?: Date;
  capabilities: {
    sleepTracking: boolean;
    heartRateMonitoring: boolean;
    respiratoryRate: boolean;
    sleepStages: boolean;
    continuousMonitoring: boolean;
  };
  batteryLevel?: number;
  firmwareVersion?: string;
}

// Health service events
export interface HealthServiceEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'permission_changed' | 'data_imported' | 'conflict_detected';
  timestamp: Date;
  data?: any;
  error?: string;
}

// Health data quality metrics
export interface DataQualityMetrics {
  completeness: number; // 0-1 scale
  accuracy: number; // 0-1 scale
  consistency: number; // 0-1 scale
  timeliness: number; // 0-1 scale
  sourceReliability: number; // 0-1 scale
  dataFreshness: number; // hours since last update
  gapAnalysis: {
    totalGaps: number;
    longestGap: number; // in hours
    averageGap: number; // in hours
  };
}

// Platform-specific error types
export interface HealthKitError {
  code: number;
  domain: string;
  description: string;
  userInfo?: Record<string, any>;
}

export interface HealthConnectError {
  errorCode: string;
  message: string;
  details?: Record<string, any>;
}

export type HealthError = HealthKitError | HealthConnectError | Error;

// Background sync configuration
export interface BackgroundSyncConfig {
  enabled: boolean;
  interval: number; // in minutes
  batteryOptimization: boolean;
  wifiOnly: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  };
}

// Health data storage optimization
export interface StorageOptimization {
  enableCompression: boolean;
  archiveOldData: boolean;
  archiveAfterDays: number;
  deleteAfterDays: number;
  maxStorageSize: number; // in MB
}

// Privacy and security settings
export interface PrivacySettings {
  localStorageOnly: boolean;
  encryptSensitiveData: boolean;
  anonymizeExports: boolean;
  allowAnalytics: boolean;
  shareWithResearchers: boolean;
  dataRetentionDays: number;
  requireBiometricAuth: boolean;
}

// Health service observer pattern
export interface HealthServiceObserver {
  onSyncStarted?: () => void;
  onSyncCompleted?: (result: HealthDataImportResult) => void;
  onSyncFailed?: (error: HealthError) => void;
  onPermissionChanged?: (permissions: HealthPermissions) => void;
  onDataImported?: (sessions: ProcessedSleepSession[]) => void;
  onConflictDetected?: (conflicts: DataConflict[]) => void;
  onInsightGenerated?: (insight: HealthInsight) => void;
}

// Utility types for health data processing
export type SleepStageMapping = Record<HealthKitSleepStage, LunarSleepStage>;
export type DataSourcePriority = Record<string, number>; // bundleIdentifier -> priority
export type QualityCalculatorFunction = (session: ProcessedSleepSession) => number;

// Health service interface
export interface IHealthService {
  // Initialization and permissions
  initialize(config: HealthServiceConfig): Promise<boolean>;
  requestPermissions(permissions: HealthPermissions): Promise<boolean>;
  checkPermissions(): Promise<HealthPermissions>;
  
  // Data sync operations
  syncHealthData(options?: HealthDataImportOptions): Promise<HealthDataImportResult>;
  enableBackgroundSync(config: BackgroundSyncConfig): Promise<boolean>;
  disableBackgroundSync(): Promise<boolean>;
  
  // Data retrieval
  getSleepData(startDate: Date, endDate: Date): Promise<RawSleepData[]>;
  getHeartRateData(startDate: Date, endDate: Date): Promise<RawHeartRateData[]>;
  getRespiratoryRateData(startDate: Date, endDate: Date): Promise<RawRespiratoryRateData[]>;
  
  // Data processing and validation
  processSleepData(rawData: RawSleepData[]): Promise<ProcessedSleepSession[]>;
  validateData(data: any): DataValidationResult;
  resolveConflicts(conflicts: DataConflict[], resolutions: ConflictResolution[]): Promise<boolean>;
  
  // Status and monitoring
  getSyncStatus(): Promise<SyncStatus>;
  getConnectedDevices(): Promise<HealthDevice[]>;
  getDataQualityMetrics(): Promise<DataQualityMetrics>;
  
  // Observer pattern
  addObserver(observer: HealthServiceObserver): void;
  removeObserver(observer: HealthServiceObserver): void;
  
  // Cleanup and maintenance
  cleanup(): Promise<void>;
}