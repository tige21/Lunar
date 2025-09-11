/**
 * Database-specific type definitions for Lunar Sleep Analysis App
 * These types match the SQLite schema structure
 */

// Database row types (as stored in SQLite)
export interface SleepSessionRow {
  id: string;
  user_id: string;
  start_time: number; // Unix timestamp
  end_time: number; // Unix timestamp
  duration: number; // in minutes
  quality_overall: number; // 0-100 scale (mapped from 1-10)
  quality_efficiency: number; // 0-100 percentage
  quality_restfulness: number; // 0-100 scale (mapped from 1-10)
  heart_rate_avg?: number;
  heart_rate_min?: number;
  heart_rate_max?: number;
  heart_rate_variability?: number;
  environment_temperature?: number;
  environment_humidity?: number;
  environment_noise_level?: number;
  environment_light_level?: number;
  notes?: string;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface SleepStageRow {
  id: string;
  session_id: string;
  stage: 'awake' | 'light' | 'deep' | 'rem';
  start_time: number; // Unix timestamp
  end_time: number; // Unix timestamp
  duration: number; // in minutes
  sequence_order: number;
  created_at: number; // Unix timestamp
}

export interface QualityFactorRow {
  id: string;
  session_id: string;
  type: 'stress' | 'caffeine' | 'exercise' | 'screen_time' | 'environment' | 'medication';
  impact: 'positive' | 'negative' | 'neutral';
  severity: 1 | 2 | 3;
  description?: string;
  created_at: number; // Unix timestamp
}

export interface HeartRateDataRow {
  id: string;
  session_id: string;
  timestamp: number; // Unix timestamp
  bpm: number;
  variability?: number;
  created_at: number; // Unix timestamp
}

export interface UserPreferencesRow {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  temperature_unit: 'celsius' | 'fahrenheit';
  time_format: '12h' | '24h';
  date_format: 'US' | 'EU' | 'ISO';
  bedtime_reminder: boolean;
  bedtime_reminder_time: number;
  wake_alarm: boolean;
  weekly_insights: boolean;
  goal_achievements: boolean;
  sleep_quality_alerts: boolean;
  share_data: boolean;
  anonymous_analytics: boolean;
  health_kit_integration: boolean;
  google_fit_integration: boolean;
  data_retention_period: number;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface HealthProfileRow {
  id: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  weight?: number; // in kg
  height?: number; // in cm
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  chronic_conditions?: string; // JSON string
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface SleepDisorderRow {
  id: string;
  user_id: string;
  type: 'insomnia' | 'sleep_apnea' | 'restless_leg' | 'narcolepsy' | 'other';
  diagnosed: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  treatment?: string;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface MedicationRow {
  id: string;
  user_id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  affects_sleep: boolean;
  notes?: string;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface SleepGoalRow {
  id: string;
  user_id: string;
  target_bedtime: string; // HH:MM format
  target_wake_time: string; // HH:MM format
  target_duration: number; // in minutes
  target_quality: number; // 0-100 scale
  is_active: boolean;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

export interface SleepInsightRow {
  id: string;
  user_id: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  action_text?: string;
  action_route?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  expires_at?: number; // Unix timestamp
  created_at: number; // Unix timestamp
}

export interface SleepMetricsRow {
  id: string;
  session_id: string;
  sleep_score: number; // 0-100
  efficiency_score: number; // 0-100
  duration_score: number; // 0-100
  consistency_score: number; // 0-100
  restoration_score: number; // 0-100
  deep_sleep_percentage: number; // 0-100
  rem_sleep_percentage: number; // 0-100
  light_sleep_percentage: number; // 0-100
  awake_percentage: number; // 0-100
  sleep_latency?: number; // in minutes
  wake_after_sleep_onset?: number; // in minutes
  number_of_awakenings: number;
  created_at: number; // Unix timestamp
}

export interface AIInteractionRow {
  id: string;
  user_id: string;
  conversation_id: string;
  type: 'question' | 'answer' | 'recommendation' | 'insight';
  content: string;
  metadata?: string; // JSON string
  context_session_ids?: string; // Comma-separated IDs
  rating?: 1 | 2 | 3 | 4 | 5;
  is_helpful?: boolean;
  created_at: number; // Unix timestamp
}

// Database query options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SleepSessionFilter extends DateRangeFilter {
  userId?: string;
  minQuality?: number;
  maxQuality?: number;
  minDuration?: number;
  maxDuration?: number;
  stages?: Array<'awake' | 'light' | 'deep' | 'rem'>;
}

export interface InsightFilter {
  userId?: string;
  type?: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  priority?: 'low' | 'medium' | 'high';
  isRead?: boolean;
  actionable?: boolean;
}

// Database operation results
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rowsAffected?: number;
}

export interface BulkInsertResult {
  success: boolean;
  insertedCount: number;
  failedCount: number;
  errors: string[];
}

// Export/Import types
export interface ExportData {
  version: string;
  exportDate: string;
  userId: string;
  sessions: SleepSessionRow[];
  stages: SleepStageRow[];
  metrics: SleepMetricsRow[];
  preferences: UserPreferencesRow;
  healthProfile: HealthProfileRow;
  goals: SleepGoalRow[];
  insights: SleepInsightRow[];
  aiInteractions?: AIInteractionRow[];
}

export interface ImportOptions {
  replaceExisting: boolean;
  preserveIds: boolean;
  skipInvalid: boolean;
}

// Aggregation types for analytics
export interface SleepTrendData {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  efficiency: number;
  consistency: number;
  improvement: number;
  sessionCount: number;
}

export interface SleepStageAnalysis {
  totalSessions: number;
  averageDeepSleep: number;
  averageRemSleep: number;
  averageLightSleep: number;
  averageAwakeTime: number;
  optimalDeepSleepPercentage: number;
  optimalRemSleepPercentage: number;
}

export interface SleepQualityAnalysis {
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: number;
  consistencyScore: number;
  factorsImpactingQuality: {
    factor: string;
    impact: number;
    frequency: number;
  }[];
}

// Database maintenance types
export interface DatabaseStats {
  totalSessions: number;
  totalStages: number;
  totalMetrics: number;
  totalInsights: number;
  totalAIInteractions: number;
  databaseSize: number; // in bytes
  oldestSession?: Date;
  newestSession?: Date;
}

export interface CleanupOptions {
  retentionDays: number;
  cleanupInsights: boolean;
  cleanupAIHistory: boolean;
  vacuum: boolean;
}

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
  checksum: string;
}