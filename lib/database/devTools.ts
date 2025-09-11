/**
 * Development Tools for Lunar Sleep App
 * Helper functions for testing and debugging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingService } from './onboardingService';

export class DevTools {
  /**
   * Reset all onboarding data for testing
   */
  static async resetOnboarding(): Promise<void> {
    try {
      await onboardingService.resetOnboarding();
      console.log('✅ Onboarding data reset successfully');
    } catch (error) {
      console.error('❌ Error resetting onboarding:', error);
      throw error;
    }
  }

  /**
   * Get current onboarding status for debugging
   */
  static async getOnboardingStatus(): Promise<{
    completed: boolean;
    sleepGoals: any;
    healthPermissions: any;
    userPreferences: any;
  }> {
    try {
      const [completed, sleepGoals, healthPermissions, userPreferences] = await Promise.all([
        onboardingService.getOnboardingStatus(),
        onboardingService.getSleepGoals(),
        onboardingService.getHealthPermissions(),
        onboardingService.getUserPreferences(),
      ]);

      return {
        completed,
        sleepGoals,
        healthPermissions,
        userPreferences,
      };
    } catch (error) {
      console.error('❌ Error getting onboarding status:', error);
      throw error;
    }
  }

  /**
   * Simulate complete onboarding for testing
   */
  static async simulateCompleteOnboarding(): Promise<void> {
    try {
      // Set sleep goals
      await onboardingService.saveSleepGoals({
        duration: 8,
        bedtime: '22:30',
        wakeTime: '06:30',
        qualityGoal: 4,
        sleepEnvironment: {
          darkRoom: true,
          coolTemperature: true,
          quietSpace: false,
          comfortableBed: true,
        },
        priorities: ['quality', 'consistency', 'energy'],
      });

      // Set user preferences with chronotype and notifications
      await onboardingService.saveUserPreferences({
        notificationsEnabled: true,
        reminderTime: '21:30',
        units: 'metric',
        theme: 'auto',
        privacyMode: true,
        aiChatIntroduced: true,
        chronotype: {
          score: 16,
          type: 'morning',
          label: 'Morning Type',
          description: 'You prefer mornings and are most productive in the first half of the day.',
          recommendations: [
            'Maintain a consistent early bedtime',
            'Exercise in the morning',
            'Plan demanding work for morning hours',
            'Wind down 2 hours before bed',
          ],
          responses: {
            bedtime_preference: 'early',
            wake_preference: 'early',
            peak_energy: 'early_morning',
            meal_timing: 'breakfast',
          },
        },
        notificationSettings: {
          bedtimeReminder: {
            enabled: true,
            time: '21:30',
            advanceMinutes: 30,
          },
          wakeUpAlarm: {
            enabled: true,
            time: '07:00',
            smartWake: true,
          },
          sleepTracking: {
            enabled: true,
            autoDetect: true,
          },
          insights: {
            enabled: true,
            frequency: 'weekly',
          },
          permissions: {
            granted: true,
            requestedAt: new Date().toISOString(),
          },
        },
      });

      // Set health permissions
      await onboardingService.saveHealthPermissions({
        hasHealthKit: true,
        requestedAt: new Date().toISOString(),
        grantedPermissions: ['HKCategoryValueSleepAnalysis', 'HKQuantityTypeIdentifierHeartRate'],
        deniedPermissions: [],
      });

      // Mark onboarding as completed
      await onboardingService.completeOnboarding();

      console.log('✅ Simulated complete onboarding successfully');
    } catch (error) {
      console.error('❌ Error simulating onboarding:', error);
      throw error;
    }
  }

  /**
   * Clear all AsyncStorage data (nuclear option)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ All AsyncStorage data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Print current AsyncStorage keys for debugging
   */
  static async debugStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('📦 AsyncStorage Keys:', keys);

      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          console.log(`${key}:`, value ? JSON.parse(value) : value);
        } catch {
          const value = await AsyncStorage.getItem(key);
          console.log(`${key}:`, value);
        }
      }
    } catch (error) {
      console.error('❌ Error debugging storage:', error);
    }
  }

  /**
   * Set specific onboarding step for testing
   */
  static async setOnboardingStep(step: number): Promise<void> {
    // This would require modifying the onboarding service to support step tracking
    console.log(`🔧 Setting onboarding to step ${step} (not implemented yet)`);
  }

  /**
   * Enable/disable specific features for testing
   */
  static async toggleFeature(feature: string, enabled: boolean): Promise<void> {
    try {
      const preferences = await onboardingService.getUserPreferences();
      
      switch (feature) {
        case 'notifications':
          await onboardingService.saveUserPreferences({
            ...preferences,
            notificationsEnabled: enabled,
          });
          break;
        case 'aiChat':
          await onboardingService.saveUserPreferences({
            ...preferences,
            aiChatIntroduced: enabled,
          });
          break;
        case 'privacy':
          await onboardingService.saveUserPreferences({
            ...preferences,
            privacyMode: enabled,
          });
          break;
        default:
          console.warn(`⚠️ Unknown feature: ${feature}`);
      }

      console.log(`✅ Feature '${feature}' set to ${enabled}`);
    } catch (error) {
      console.error(`❌ Error toggling feature '${feature}':`, error);
      throw error;
    }
  }
}

// Add global dev tools for easy access in console
if (__DEV__) {
  // @ts-ignore
  global.LunarDevTools = DevTools;
  console.log('🛠️ Lunar Dev Tools available as global.LunarDevTools');
}

export default DevTools;