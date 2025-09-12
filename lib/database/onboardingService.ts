/**
 * Onboarding Database Service
 * Handles storing and retrieving onboarding completion status and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@lunar_onboarding_completed',
  USER_SLEEP_GOALS: '@lunar_user_sleep_goals',
  HEALTH_PERMISSIONS: '@lunar_health_permissions',
  USER_PREFERENCES: '@lunar_user_preferences',
} as const;

export interface SleepGoals {
  duration: number; // hours
  bedtime: string; // "22:30"
  wakeTime: string; // "06:30"
  qualityGoal: number; // 1-5 scale
  sleepEnvironment: {
    darkRoom: boolean;
    coolTemperature: boolean;
    quietSpace: boolean;
    comfortableBed: boolean;
  };
  priorities: string[]; // What user wants to improve
  createdAt: string;
  updatedAt: string;
}

export interface HealthPermissions {
  hasHealthKit: boolean;
  requestedAt: string;
  grantedPermissions: string[];
  deniedPermissions: string[];
}

export interface ChronotypeResults {
  score: number;
  type: 'extreme_morning' | 'morning' | 'neutral' | 'evening' | 'extreme_evening';
  label: string;
  description: string;
  recommendations: string[];
  responses: Record<string, string>;
}

export interface NotificationSettings {
  bedtimeReminder: {
    enabled: boolean;
    time: string;
    advanceMinutes: number;
  };
  wakeUpAlarm: {
    enabled: boolean;
    time: string;
    smartWake: boolean;
  };
  sleepTracking: {
    enabled: boolean;
    autoDetect: boolean;
  };
  insights: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
  };
  permissions: {
    granted: boolean;
    requestedAt?: string;
  };
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  reminderTime: string;
  units: 'metric' | 'imperial';
  theme: 'auto' | 'light' | 'dark';
  privacyMode: boolean;
  chronotype?: ChronotypeResults;
  notificationSettings?: NotificationSettings;
  aiChatIntroduced?: boolean;
  language?: 'en' | 'ru';
}

class OnboardingService {
  /**
   * Check if user has completed onboarding
   */
  async getOnboardingStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return status === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw new Error('Failed to save onboarding status');
    }
  }

  /**
   * Reset onboarding status (for testing/debugging)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SLEEP_GOALS);
      await AsyncStorage.removeItem(STORAGE_KEYS.HEALTH_PERMISSIONS);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }

  /**
   * Save user's sleep goals
   */
  async saveSleepGoals(goals: Omit<SleepGoals, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const now = new Date().toISOString();
      const existingGoals = await this.getSleepGoals();
      
      const goalsWithTimestamps: SleepGoals = {
        ...goals,
        createdAt: existingGoals?.createdAt || now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SLEEP_GOALS, 
        JSON.stringify(goalsWithTimestamps)
      );
    } catch (error) {
      console.error('Error saving sleep goals:', error);
      throw new Error('Failed to save sleep goals');
    }
  }

  /**
   * Get user's sleep goals
   */
  async getSleepGoals(): Promise<SleepGoals | null> {
    try {
      const goals = await AsyncStorage.getItem(STORAGE_KEYS.USER_SLEEP_GOALS);
      return goals ? JSON.parse(goals) : null;
    } catch (error) {
      console.error('Error getting sleep goals:', error);
      return null;
    }
  }

  /**
   * Save health permissions status
   */
  async saveHealthPermissions(permissions: HealthPermissions): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.HEALTH_PERMISSIONS, 
        JSON.stringify(permissions)
      );
    } catch (error) {
      console.error('Error saving health permissions:', error);
      throw new Error('Failed to save health permissions');
    }
  }

  /**
   * Get health permissions status
   */
  async getHealthPermissions(): Promise<HealthPermissions | null> {
    try {
      const permissions = await AsyncStorage.getItem(STORAGE_KEYS.HEALTH_PERMISSIONS);
      return permissions ? JSON.parse(permissions) : null;
    } catch (error) {
      console.error('Error getting health permissions:', error);
      return null;
    }
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES, 
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  /**
   * Get user preferences with defaults
   */
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      
      const defaults: UserPreferences = {
        notificationsEnabled: true,
        reminderTime: '21:30',
        units: 'metric',
        theme: 'auto',
        privacyMode: true,
        aiChatIntroduced: false,
      };

      return preferences ? { ...defaults, ...JSON.parse(preferences) } : defaults;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return defaults on error
      return {
        notificationsEnabled: true,
        reminderTime: '21:30',
        units: 'metric',
        theme: 'auto',
        privacyMode: true,
        aiChatIntroduced: false,
      };
    }
  }

  /**
   * Clear all onboarding data
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all(
        Object.values(STORAGE_KEYS).map(key => AsyncStorage.removeItem(key))
      );
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
export default onboardingService;