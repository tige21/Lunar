export interface AppSettings {
  version: string;
  theme: {
    mode: 'light' | 'dark' | 'auto';
    followSystem: boolean;
  };
  language: {
    interface: 'ru' | 'en' | 'auto';
    ai: 'ru' | 'en' | 'auto';
  };
  ai: {
    enabled: boolean;
    style: 'friendly' | 'professional' | 'scientific';
    responseLength: 'brief' | 'medium' | 'detailed';
    personalizedTips: boolean;
    contextEnabled: boolean;
    saveHistory: boolean;
  };
  notifications: {
    bedtimeReminders: boolean;
    bedtimeTime: string; // HH:MM format
    wakeUpAlarms: boolean;
    wakeUpTime: string; // HH:MM format
    sleepInsights: boolean;
    weeklyReports: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
    };
  };
  sleepTracking: {
    autoDetection: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    trackWeekends: boolean;
    sleepGoal: number; // hours
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    aiDataSharing: boolean;
    biometricLock: boolean;
  };
  display: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceAnimations: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  version: '1.0.0',
  theme: {
    mode: 'auto',
    followSystem: true,
  },
  language: {
    interface: 'auto',
    ai: 'auto',
  },
  ai: {
    enabled: true,
    style: 'friendly',
    responseLength: 'medium',
    personalizedTips: true,
    contextEnabled: true,
    saveHistory: true,
  },
  notifications: {
    bedtimeReminders: true,
    bedtimeTime: '22:00',
    wakeUpAlarms: true,
    wakeUpTime: '07:00',
    sleepInsights: true,
    weeklyReports: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  },
  sleepTracking: {
    autoDetection: true,
    sensitivity: 'medium',
    trackWeekends: true,
    sleepGoal: 8,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    aiDataSharing: false,
    biometricLock: false,
  },
  display: {
    fontSize: 'medium',
    highContrast: false,
    reduceAnimations: false,
  },
};

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}