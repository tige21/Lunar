/**
 * User-specific database operations for Lunar Sleep Analysis App
 * Handles user preferences, health profile, goals, and insights
 */

import { database } from './database';
import type {
  UserPreferencesRow,
  HealthProfileRow,
  SleepGoalRow,
  SleepInsightRow,
  SleepDisorderRow,
  MedicationRow,
  DatabaseResult,
  InsightFilter,
  QueryOptions
} from './types';
import type {
  User,
  UserPreferences,
  HealthProfile,
  SleepDisorder,
  Medication
} from '../../types/user';
import type { SleepGoal, SleepInsight } from '../../types/sleep';
import { generateId } from '../utils/id';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // === USER PREFERENCES ===

  /**
   * Get user preferences
   */
  async getPreferences(userId: string = 'default_user'): Promise<DatabaseResult<UserPreferences>> {
    try {
      const result = await database.executeQueryFirst<UserPreferencesRow>(`
        SELECT * FROM user_preferences WHERE id = ?
      `, [userId]);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'User preferences not found'
        };
      }

      const preferences: UserPreferences = {
        theme: result.data.theme,
        language: result.data.language,
        timezone: result.data.timezone,
        notifications: {
          bedtimeReminder: result.data.bedtime_reminder,
          bedtimeReminderTime: result.data.bedtime_reminder_time,
          wakeUpAlarm: result.data.wake_alarm,
          weeklyInsights: result.data.weekly_insights,
          goalAchievements: result.data.goal_achievements,
          sleepQualityAlerts: result.data.sleep_quality_alerts
        },
        units: {
          temperature: result.data.temperature_unit,
          timeFormat: result.data.time_format,
          dateFormat: result.data.date_format
        },
        privacy: {
          shareData: result.data.share_data,
          anonymousAnalytics: result.data.anonymous_analytics,
          healthKitIntegration: result.data.health_kit_integration,
          googleFitIntegration: result.data.google_fit_integration,
          dataRetentionPeriod: result.data.data_retention_period
        }
      };

      return { success: true, data: preferences };

    } catch (error) {
      console.error('[UserService] Failed to get preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string = 'default_user',
    preferences: Partial<UserPreferences>
  ): Promise<DatabaseResult<void>> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];

      // Theme
      if (preferences.theme) {
        setClauses.push('theme = ?');
        params.push(preferences.theme);
      }

      // Language
      if (preferences.language) {
        setClauses.push('language = ?');
        params.push(preferences.language);
      }

      // Timezone
      if (preferences.timezone) {
        setClauses.push('timezone = ?');
        params.push(preferences.timezone);
      }

      // Notifications
      if (preferences.notifications) {
        const notifs = preferences.notifications;
        if (notifs.bedtimeReminder !== undefined) {
          setClauses.push('bedtime_reminder = ?');
          params.push(notifs.bedtimeReminder);
        }
        if (notifs.bedtimeReminderTime !== undefined) {
          setClauses.push('bedtime_reminder_time = ?');
          params.push(notifs.bedtimeReminderTime);
        }
        if (notifs.wakeUpAlarm !== undefined) {
          setClauses.push('wake_alarm = ?');
          params.push(notifs.wakeUpAlarm);
        }
        if (notifs.weeklyInsights !== undefined) {
          setClauses.push('weekly_insights = ?');
          params.push(notifs.weeklyInsights);
        }
        if (notifs.goalAchievements !== undefined) {
          setClauses.push('goal_achievements = ?');
          params.push(notifs.goalAchievements);
        }
        if (notifs.sleepQualityAlerts !== undefined) {
          setClauses.push('sleep_quality_alerts = ?');
          params.push(notifs.sleepQualityAlerts);
        }
      }

      // Units
      if (preferences.units) {
        const units = preferences.units;
        if (units.temperature) {
          setClauses.push('temperature_unit = ?');
          params.push(units.temperature);
        }
        if (units.timeFormat) {
          setClauses.push('time_format = ?');
          params.push(units.timeFormat);
        }
        if (units.dateFormat) {
          setClauses.push('date_format = ?');
          params.push(units.dateFormat);
        }
      }

      // Privacy
      if (preferences.privacy) {
        const privacy = preferences.privacy;
        if (privacy.shareData !== undefined) {
          setClauses.push('share_data = ?');
          params.push(privacy.shareData);
        }
        if (privacy.anonymousAnalytics !== undefined) {
          setClauses.push('anonymous_analytics = ?');
          params.push(privacy.anonymousAnalytics);
        }
        if (privacy.healthKitIntegration !== undefined) {
          setClauses.push('health_kit_integration = ?');
          params.push(privacy.healthKitIntegration);
        }
        if (privacy.googleFitIntegration !== undefined) {
          setClauses.push('google_fit_integration = ?');
          params.push(privacy.googleFitIntegration);
        }
        if (privacy.dataRetentionPeriod !== undefined) {
          setClauses.push('data_retention_period = ?');
          params.push(privacy.dataRetentionPeriod);
        }
      }

      if (setClauses.length === 0) {
        return { success: true };
      }

      params.push(userId);

      const result = await database.executeUpdate(`
        UPDATE user_preferences 
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `, params);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[UserService] Failed to update preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === HEALTH PROFILE ===

  /**
   * Get user health profile
   */
  async getHealthProfile(userId: string = 'default_user'): Promise<DatabaseResult<HealthProfile>> {
    try {
      const result = await database.executeQueryFirst<HealthProfileRow>(`
        SELECT * FROM health_profile WHERE id = ?
      `, [userId]);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Health profile not found'
        };
      }

      // Get sleep disorders
      const disordersResult = await database.executeQuery<SleepDisorderRow>(`
        SELECT * FROM sleep_disorders WHERE user_id = ?
      `, [userId]);

      // Get medications
      const medicationsResult = await database.executeQuery<MedicationRow>(`
        SELECT * FROM medications WHERE user_id = ?
      `, [userId]);

      const sleepDisorders: SleepDisorder[] = disordersResult.success 
        ? (disordersResult.data || []).map(row => ({
            type: row.type,
            diagnosed: row.diagnosed,
            severity: row.severity,
            treatment: row.treatment
          }))
        : [];

      const medications: Medication[] = medicationsResult.success
        ? (medicationsResult.data || []).map(row => ({
            name: row.name,
            dosage: row.dosage,
            frequency: row.frequency,
            affectsSleep: row.affects_sleep,
            notes: row.notes
          }))
        : [];

      const healthProfile: HealthProfile = {
        age: result.data.age,
        gender: result.data.gender,
        weight: result.data.weight,
        height: result.data.height,
        activityLevel: result.data.activity_level,
        sleepDisorders,
        medications,
        chronicConditions: result.data.chronic_conditions 
          ? JSON.parse(result.data.chronic_conditions)
          : []
      };

      return { success: true, data: healthProfile };

    } catch (error) {
      console.error('[UserService] Failed to get health profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user health profile
   */
  async updateHealthProfile(
    userId: string = 'default_user',
    profile: Partial<HealthProfile>
  ): Promise<DatabaseResult<void>> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];

      if (profile.age !== undefined) {
        setClauses.push('age = ?');
        params.push(profile.age);
      }

      if (profile.gender !== undefined) {
        setClauses.push('gender = ?');
        params.push(profile.gender);
      }

      if (profile.weight !== undefined) {
        setClauses.push('weight = ?');
        params.push(profile.weight);
      }

      if (profile.height !== undefined) {
        setClauses.push('height = ?');
        params.push(profile.height);
      }

      if (profile.activityLevel) {
        setClauses.push('activity_level = ?');
        params.push(profile.activityLevel);
      }

      if (profile.chronicConditions !== undefined) {
        setClauses.push('chronic_conditions = ?');
        params.push(JSON.stringify(profile.chronicConditions));
      }

      if (setClauses.length > 0) {
        params.push(userId);

        const result = await database.executeUpdate(`
          UPDATE health_profile 
          SET ${setClauses.join(', ')}
          WHERE id = ?
        `, params);

        if (!result.success) {
          return result;
        }
      }

      // Update sleep disorders if provided
      if (profile.sleepDisorders) {
        await this.updateSleepDisorders(userId, profile.sleepDisorders);
      }

      // Update medications if provided
      if (profile.medications) {
        await this.updateMedications(userId, profile.medications);
      }

      return { success: true };

    } catch (error) {
      console.error('[UserService] Failed to update health profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update sleep disorders
   */
  private async updateSleepDisorders(
    userId: string,
    disorders: SleepDisorder[]
  ): Promise<DatabaseResult<void>> {
    try {
      // Delete existing disorders
      await database.executeUpdate(`
        DELETE FROM sleep_disorders WHERE user_id = ?
      `, [userId]);

      // Insert new disorders
      if (disorders.length > 0) {
        const queries = disorders.map(disorder => ({
          sql: `
            INSERT INTO sleep_disorders (
              id, user_id, type, diagnosed, severity, treatment
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          params: [
            generateId(),
            userId,
            disorder.type,
            disorder.diagnosed,
            disorder.severity || null,
            disorder.treatment || null
          ]
        }));

        await database.executeTransaction(queries);
      }

      return { success: true };

    } catch (error) {
      console.error('[UserService] Failed to update sleep disorders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update medications
   */
  private async updateMedications(
    userId: string,
    medications: Medication[]
  ): Promise<DatabaseResult<void>> {
    try {
      // Delete existing medications
      await database.executeUpdate(`
        DELETE FROM medications WHERE user_id = ?
      `, [userId]);

      // Insert new medications
      if (medications.length > 0) {
        const queries = medications.map(medication => ({
          sql: `
            INSERT INTO medications (
              id, user_id, name, dosage, frequency, affects_sleep, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          params: [
            generateId(),
            userId,
            medication.name,
            medication.dosage || null,
            medication.frequency || null,
            medication.affectsSleep,
            medication.notes || null
          ]
        }));

        await database.executeTransaction(queries);
      }

      return { success: true };

    } catch (error) {
      console.error('[UserService] Failed to update medications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SLEEP GOALS ===

  /**
   * Get active sleep goal
   */
  async getActiveGoal(userId: string = 'default_user'): Promise<DatabaseResult<SleepGoal | null>> {
    try {
      const result = await database.executeQueryFirst<SleepGoalRow>(`
        SELECT * FROM sleep_goals 
        WHERE user_id = ? AND is_active = 1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId]);

      if (!result.success) {
        return result;
      }

      if (!result.data) {
        return { success: true, data: null };
      }

      const goal: SleepGoal = {
        id: result.data.id,
        userId: result.data.user_id,
        targetBedtime: result.data.target_bedtime,
        targetWakeTime: result.data.target_wake_time,
        targetDuration: result.data.target_duration,
        targetQuality: Math.round((result.data.target_quality / 100) * 9 + 1), // Convert to 1-10 scale
        isActive: result.data.is_active,
        createdAt: new Date(result.data.created_at * 1000),
        updatedAt: new Date(result.data.updated_at * 1000)
      };

      return { success: true, data: goal };

    } catch (error) {
      console.error('[UserService] Failed to get active goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create or update sleep goal
   */
  async setGoal(
    userId: string = 'default_user',
    goal: Omit<SleepGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<DatabaseResult<string>> {
    try {
      const goalId = generateId();
      const targetQuality = Math.round((goal.targetQuality - 1) * (100 / 9)); // Convert to 0-100 scale

      // Deactivate existing goals
      await database.executeUpdate(`
        UPDATE sleep_goals SET is_active = 0 WHERE user_id = ?
      `, [userId]);

      // Create new goal
      const result = await database.executeUpdate(`
        INSERT INTO sleep_goals (
          id, user_id, target_bedtime, target_wake_time, 
          target_duration, target_quality, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        goalId,
        userId,
        goal.targetBedtime,
        goal.targetWakeTime,
        goal.targetDuration,
        targetQuality,
        goal.isActive ? 1 : 0
      ]);

      if (!result.success) {
        return result;
      }

      return { success: true, data: goalId };

    } catch (error) {
      console.error('[UserService] Failed to set goal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all sleep goals for user
   */
  async getGoals(userId: string = 'default_user'): Promise<DatabaseResult<SleepGoal[]>> {
    try {
      const result = await database.executeQuery<SleepGoalRow>(`
        SELECT * FROM sleep_goals 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [userId]);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const goals: SleepGoal[] = result.data.map(row => ({
        id: row.id,
        userId: row.user_id,
        targetBedtime: row.target_bedtime,
        targetWakeTime: row.target_wake_time,
        targetDuration: row.target_duration,
        targetQuality: Math.round((row.target_quality / 100) * 9 + 1), // Convert to 1-10 scale
        isActive: row.is_active,
        createdAt: new Date(row.created_at * 1000),
        updatedAt: new Date(row.updated_at * 1000)
      }));

      return { success: true, data: goals };

    } catch (error) {
      console.error('[UserService] Failed to get goals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SLEEP INSIGHTS ===

  /**
   * Create a new insight
   */
  async createInsight(
    userId: string = 'default_user',
    insight: Omit<SleepInsight, 'id' | 'userId' | 'createdAt'>
  ): Promise<DatabaseResult<string>> {
    try {
      const insightId = generateId();
      const expiresAt = insight.type === 'achievement' 
        ? Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000) // 7 days from now
        : null;

      const result = await database.executeUpdate(`
        INSERT INTO sleep_insights (
          id, user_id, type, title, description, actionable,
          action_text, action_route, priority, is_read, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        insightId,
        userId,
        insight.type,
        insight.title,
        insight.description,
        insight.actionable ? 1 : 0,
        insight.actionText || null,
        insight.actionRoute || null,
        insight.priority,
        insight.isRead ? 1 : 0,
        expiresAt
      ]);

      if (!result.success) {
        return result;
      }

      return { success: true, data: insightId };

    } catch (error) {
      console.error('[UserService] Failed to create insight:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get insights with filtering and pagination
   */
  async getInsights(
    userId: string = 'default_user',
    filter: InsightFilter = {},
    options: QueryOptions = {}
  ): Promise<DatabaseResult<SleepInsight[]>> {
    try {
      let whereClause = 'WHERE user_id = ?';
      const params: any[] = [userId];

      // Apply filters
      if (filter.type) {
        whereClause += ' AND type = ?';
        params.push(filter.type);
      }

      if (filter.priority) {
        whereClause += ' AND priority = ?';
        params.push(filter.priority);
      }

      if (filter.isRead !== undefined) {
        whereClause += ' AND is_read = ?';
        params.push(filter.isRead ? 1 : 0);
      }

      if (filter.actionable !== undefined) {
        whereClause += ' AND actionable = ?';
        params.push(filter.actionable ? 1 : 0);
      }

      // Only show non-expired insights
      whereClause += ' AND (expires_at IS NULL OR expires_at > ?)';
      params.push(Math.floor(Date.now() / 1000));

      // Build query
      const orderBy = options.orderBy || 'created_at';
      const orderDirection = options.orderDirection || 'DESC';
      
      let limitClause = '';
      if (options.limit) {
        limitClause += ` LIMIT ${options.limit}`;
        if (options.offset) {
          limitClause += ` OFFSET ${options.offset}`;
        }
      }

      const sql = `
        SELECT * FROM sleep_insights 
        ${whereClause} 
        ORDER BY ${orderBy} ${orderDirection}
        ${limitClause}
      `;

      const result = await database.executeQuery<SleepInsightRow>(sql, params);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const insights: SleepInsight[] = result.data.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        description: row.description,
        actionable: row.actionable,
        actionText: row.action_text,
        actionRoute: row.action_route,
        priority: row.priority,
        isRead: row.is_read,
        createdAt: new Date(row.created_at * 1000)
      }));

      return { success: true, data: insights };

    } catch (error) {
      console.error('[UserService] Failed to get insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mark insight as read
   */
  async markInsightAsRead(insightId: string): Promise<DatabaseResult<void>> {
    try {
      const result = await database.executeUpdate(`
        UPDATE sleep_insights SET is_read = 1 WHERE id = ?
      `, [insightId]);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[UserService] Failed to mark insight as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete insight
   */
  async deleteInsight(insightId: string): Promise<DatabaseResult<void>> {
    try {
      const result = await database.executeUpdate(`
        DELETE FROM sleep_insights WHERE id = ?
      `, [insightId]);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[UserService] Failed to delete insight:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get unread insights count
   */
  async getUnreadInsightsCount(userId: string = 'default_user'): Promise<DatabaseResult<number>> {
    try {
      const result = await database.executeQueryFirst<{ count: number }>(`
        SELECT COUNT(*) as count FROM sleep_insights 
        WHERE user_id = ? AND is_read = 0 
        AND (expires_at IS NULL OR expires_at > ?)
      `, [userId, Math.floor(Date.now() / 1000)]);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data?.count || 0
      };

    } catch (error) {
      console.error('[UserService] Failed to get unread insights count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up expired insights
   */
  async cleanupExpiredInsights(): Promise<DatabaseResult<number>> {
    try {
      const result = await database.executeUpdate(`
        DELETE FROM sleep_insights 
        WHERE expires_at IS NOT NULL AND expires_at <= ?
      `, [Math.floor(Date.now() / 1000)]);

      return {
        success: true,
        data: result.rowsAffected || 0
      };

    } catch (error) {
      console.error('[UserService] Failed to cleanup expired insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Get complete user profile
   */
  async getUser(userId: string = 'default_user'): Promise<DatabaseResult<User>> {
    try {
      const [preferencesResult, healthProfileResult] = await Promise.all([
        this.getPreferences(userId),
        this.getHealthProfile(userId)
      ]);

      if (!preferencesResult.success || !healthProfileResult.success) {
        return {
          success: false,
          error: 'Failed to get user data'
        };
      }

      const user: User = {
        id: userId,
        preferences: preferencesResult.data!,
        healthProfile: healthProfileResult.data!,
        createdAt: new Date(), // Would be stored in user table
        updatedAt: new Date()
      };

      return { success: true, data: user };

    } catch (error) {
      console.error('[UserService] Failed to get user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance();