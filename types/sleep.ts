export interface SleepSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  quality: SleepQuality;
  stages: SleepStage[];
  heartRate?: HeartRateData[];
  environment?: EnvironmentData;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepStage {
  id: string;
  sessionId: string;
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
}

export interface SleepQuality {
  overall: number; // 1-10 scale
  efficiency: number; // percentage
  restfulness: number; // 1-10 scale
  factors?: QualityFactor[];
}

export interface QualityFactor {
  type: 'stress' | 'caffeine' | 'exercise' | 'screen_time' | 'environment' | 'medication';
  impact: 'positive' | 'negative' | 'neutral';
  severity: 1 | 2 | 3; // low, medium, high
  description?: string;
}

export interface HeartRateData {
  timestamp: Date;
  bpm: number;
  variability?: number;
}

export interface EnvironmentData {
  temperature?: number; // celsius
  humidity?: number; // percentage
  noiseLevel?: number; // decibels
  lightLevel?: number; // lux
}

export interface SleepGoal {
  id: string;
  userId: string;
  targetBedtime: string; // HH:MM format
  targetWakeTime: string; // HH:MM format
  targetDuration: number; // in minutes
  targetQuality: number; // 1-10 scale
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepInsight {
  id: string;
  userId: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  title: string;
  description: string;
  actionable?: boolean;
  actionText?: string;
  actionRoute?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

export interface SleepTrend {
  period: 'week' | 'month' | 'quarter' | 'year';
  averageDuration: number;
  averageQuality: number;
  averageBedtime: string;
  averageWakeTime: string;
  efficiency: number;
  consistency: number; // 0-100 percentage
  improvement: number; // percentage change from previous period
}