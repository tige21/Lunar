export const APP_CONFIG = {
  name: 'Lunar Sleep Tracker',
  version: '1.0.0',
  bundleId: {
    ios: 'com.lunar.sleep',
    android: 'com.lunar.sleep',
  },
  scheme: 'lunar',
  website: 'https://lunar-sleep.app',
  support: 'support@lunar-sleep.app',
} as const;

export const DATABASE_CONFIG = {
  name: 'lunar_sleep.db',
  version: 1,
  tables: [
    'users',
    'sleep_sessions',
    'sleep_stages',
    'sleep_goals',
    'sleep_insights',
    'heart_rate_data',
    'environment_data',
    'user_preferences',
    'health_profile',
  ],
} as const;

export const SLEEP_CONSTANTS = {
  // Recommended sleep duration by age (in hours)
  RECOMMENDED_SLEEP: {
    '18-25': { min: 7, max: 9 },
    '26-64': { min: 7, max: 9 },
    '65+': { min: 7, max: 8 },
  },
  
  // Sleep stage percentages (normal ranges)
  STAGE_PERCENTAGES: {
    deep: { min: 13, max: 23 },
    rem: { min: 20, max: 25 },
    light: { min: 45, max: 55 },
    awake: { min: 2, max: 5 },
  },
  
  // Quality thresholds
  QUALITY_THRESHOLDS: {
    excellent: 8.5,
    good: 7.0,
    fair: 5.5,
    poor: 4.0,
  },
  
  // Efficiency thresholds (time asleep vs. time in bed)
  EFFICIENCY_THRESHOLDS: {
    excellent: 85,
    good: 80,
    fair: 75,
    poor: 70,
  },
} as const;

export const NOTIFICATION_TYPES = {
  BEDTIME_REMINDER: 'bedtime_reminder',
  WAKE_UP_ALARM: 'wake_up_alarm',
  WEEKLY_INSIGHT: 'weekly_insight',
  GOAL_ACHIEVEMENT: 'goal_achievement',
  QUALITY_ALERT: 'quality_alert',
  DATA_SYNC: 'data_sync',
} as const;

export const ROUTES = {
  TABS: {
    DASHBOARD: '/',
    ANALYTICS: '/analytics',
    CHAT: '/chat',
    IMPROVE: '/improve',
    SETTINGS: '/settings',
  },
  MODALS: {
    SLEEP_LOG: '/sleep-log',
    GOAL_SETUP: '/goal-setup',
    ONBOARDING: '/onboarding',
    HEALTH_CONNECT: '/health-connect',
  },
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC: 'last_sync',
  HEALTH_KIT_AUTHORIZED: 'health_kit_authorized',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

export const COLORS = {
  LUNAR: {
    PRIMARY: '#6C63FF',
    SECONDARY: '#4ECDC4',
    ACCENT: '#45B7D1',
    DARK: '#1a1a2e',
    DARKER: '#16213e',
    LIGHT: '#0f3460',
    TEXT: '#E94560',
  },
  SLEEP: {
    DEEP: '#2D3748',
    REM: '#4A5568',
    LIGHT: '#718096',
    WAKE: '#A0AEC0',
  },
  STATUS: {
    SUCCESS: '#48BB78',
    WARNING: '#ED8936',
    ERROR: '#F56565',
    INFO: '#4299E1',
  },
} as const;