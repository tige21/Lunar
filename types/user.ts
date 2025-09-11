export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  preferences: UserPreferences;
  healthProfile: HealthProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  units: UnitPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  bedtimeReminder: boolean;
  bedtimeReminderTime: number; // minutes before target bedtime
  wakeUpAlarm: boolean;
  weeklyInsights: boolean;
  goalAchievements: boolean;
  sleepQualityAlerts: boolean;
}

export interface UnitPreferences {
  temperature: 'celsius' | 'fahrenheit';
  timeFormat: '12h' | '24h';
  dateFormat: 'US' | 'EU' | 'ISO';
}

export interface PrivacyPreferences {
  shareData: boolean;
  anonymousAnalytics: boolean;
  healthKitIntegration: boolean;
  googleFitIntegration: boolean;
  dataRetentionPeriod: number; // in days
}

export interface HealthProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  weight?: number; // in kg
  height?: number; // in cm
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  sleepDisorders?: SleepDisorder[];
  medications?: Medication[];
  chronicConditions?: string[];
}

export interface SleepDisorder {
  type: 'insomnia' | 'sleep_apnea' | 'restless_leg' | 'narcolepsy' | 'other';
  diagnosed: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  treatment?: string;
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  affectsSleep: boolean;
  notes?: string;
}