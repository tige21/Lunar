export * from './sleep';
export * from './user';

// Common API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: Date;
}

// Database types
export interface DatabaseConfig {
  name: string;
  version: number;
  tables: string[];
}

// Health integration types
export interface HealthKitData {
  sleepAnalysis: any[];
  heartRate: any[];
  steps: any[];
  workouts: any[];
}

export interface GoogleFitData {
  sleepSessions: any[];
  heartRate: any[];
  steps: any[];
  activities: any[];
}

// AI/ML types
export interface SleepPrediction {
  recommendedBedtime: string;
  expectedQuality: number;
  confidence: number;
  factors: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'bedtime' | 'environment' | 'lifestyle' | 'diet';
  title: string;
  description: string;
  evidence: string[];
  expectedImpact: number; // 1-10 scale
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}