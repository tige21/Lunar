/**
 * Data management service for Lunar Sleep Analysis App
 * Handles data export, import, backup, and cleanup operations
 */

import { database } from './database';
import type {
  ExportData,
  ImportOptions,
  DatabaseResult,
  CleanupOptions,
  BackupInfo,
  DatabaseStats,
  SleepSessionRow,
  SleepStageRow,
  SleepMetricsRow,
  UserPreferencesRow,
  HealthProfileRow,
  SleepGoalRow,
  SleepInsightRow,
  AIInteractionRow
} from './types';
import { generateId } from '../utils/id';

export class DataService {
  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // === DATA EXPORT ===

  /**
   * Export all user data to JSON format
   */
  async exportUserData(
    userId: string = 'default_user',
    includeAIHistory: boolean = false
  ): Promise<DatabaseResult<ExportData>> {
    try {
      console.log('[DataService] Starting data export for user:', userId);

      // Get all data in parallel for better performance
      const [
        sessionsResult,
        stagesResult,
        metricsResult,
        preferencesResult,
        healthProfileResult,
        goalsResult,
        insightsResult,
        aiHistoryResult
      ] = await Promise.all([
        database.executeQuery<SleepSessionRow>('SELECT * FROM sleep_sessions WHERE user_id = ?', [userId]),
        database.executeQuery<SleepStageRow>('SELECT * FROM sleep_stages WHERE session_id IN (SELECT id FROM sleep_sessions WHERE user_id = ?)', [userId]),
        database.executeQuery<SleepMetricsRow>('SELECT * FROM sleep_metrics WHERE session_id IN (SELECT id FROM sleep_sessions WHERE user_id = ?)', [userId]),
        database.executeQueryFirst<UserPreferencesRow>('SELECT * FROM user_preferences WHERE id = ?', [userId]),
        database.executeQueryFirst<HealthProfileRow>('SELECT * FROM health_profile WHERE id = ?', [userId]),
        database.executeQuery<SleepGoalRow>('SELECT * FROM sleep_goals WHERE user_id = ?', [userId]),
        database.executeQuery<SleepInsightRow>('SELECT * FROM sleep_insights WHERE user_id = ?', [userId]),
        includeAIHistory 
          ? database.executeQuery<AIInteractionRow>('SELECT * FROM ai_interactions WHERE user_id = ?', [userId])
          : Promise.resolve({ success: true, data: [] })
      ]);

      // Check for any failed queries
      const results = [sessionsResult, stagesResult, metricsResult, preferencesResult, healthProfileResult, goalsResult, insightsResult];
      const failedResult = results.find(result => !result.success);
      if (failedResult) {
        return { success: false, error: failedResult.error };
      }

      // Prepare export data
      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userId,
        sessions: sessionsResult.data || [],
        stages: stagesResult.data || [],
        metrics: metricsResult.data || [],
        preferences: preferencesResult.data!,
        healthProfile: healthProfileResult.data!,
        goals: goalsResult.data || [],
        insights: insightsResult.data || [],
        aiInteractions: aiHistoryResult.success ? aiHistoryResult.data : undefined
      };

      console.log('[DataService] Export completed:', {
        sessions: exportData.sessions.length,
        stages: exportData.stages.length,
        metrics: exportData.metrics.length,
        goals: exportData.goals.length,
        insights: exportData.insights.length,
        aiInteractions: exportData.aiInteractions?.length || 0
      });

      return { success: true, data: exportData };

    } catch (error) {
      console.error('[DataService] Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export user data to CSV format
   */
  async exportToCSV(
    userId: string = 'default_user',
    dataType: 'sessions' | 'stages' | 'metrics' = 'sessions'
  ): Promise<DatabaseResult<string>> {
    try {
      let csvData = '';

      switch (dataType) {
        case 'sessions': {
          const sessionsResult = await database.executeQuery<SleepSessionRow>(`
            SELECT * FROM sleep_sessions WHERE user_id = ? ORDER BY start_time DESC
          `, [userId]);

          if (!sessionsResult.success || !sessionsResult.data) {
            return { success: false, error: sessionsResult.error };
          }

          // CSV header
          csvData = 'Date,Start Time,End Time,Duration (min),Quality Overall,Efficiency %,Restfulness,Notes\n';
          
          // CSV rows
          sessionsResult.data.forEach(session => {
            const startDate = new Date(session.start_time * 1000);
            const endDate = new Date(session.end_time * 1000);
            
            csvData += [
              startDate.toDateString(),
              startDate.toTimeString().split(' ')[0],
              endDate.toTimeString().split(' ')[0],
              session.duration,
              session.quality_overall,
              session.quality_efficiency,
              session.quality_restfulness,
              `"${(session.notes || '').replace(/"/g, '""')}"`
            ].join(',') + '\n';
          });
          break;
        }

        case 'stages': {
          const stagesResult = await database.executeQuery<SleepStageRow & { session_start: number }>(`
            SELECT s.*, ss.start_time as session_start 
            FROM sleep_stages s
            JOIN sleep_sessions ss ON s.session_id = ss.id
            WHERE ss.user_id = ?
            ORDER BY ss.start_time DESC, s.sequence_order ASC
          `, [userId]);

          if (!stagesResult.success || !stagesResult.data) {
            return { success: false, error: stagesResult.error };
          }

          csvData = 'Session Date,Stage,Start Time,End Time,Duration (min)\n';
          
          stagesResult.data.forEach(stage => {
            const sessionDate = new Date(stage.session_start * 1000);
            const stageStart = new Date(stage.start_time * 1000);
            const stageEnd = new Date(stage.end_time * 1000);
            
            csvData += [
              sessionDate.toDateString(),
              stage.stage,
              stageStart.toTimeString().split(' ')[0],
              stageEnd.toTimeString().split(' ')[0],
              stage.duration
            ].join(',') + '\n';
          });
          break;
        }

        case 'metrics': {
          const metricsResult = await database.executeQuery<SleepMetricsRow & { start_time: number }>(`
            SELECT m.*, ss.start_time 
            FROM sleep_metrics m
            JOIN sleep_sessions ss ON m.session_id = ss.id
            WHERE ss.user_id = ?
            ORDER BY ss.start_time DESC
          `, [userId]);

          if (!metricsResult.success || !metricsResult.data) {
            return { success: false, error: metricsResult.error };
          }

          csvData = 'Date,Sleep Score,Efficiency Score,Duration Score,Deep Sleep %,REM Sleep %,Light Sleep %,Awake %\n';
          
          metricsResult.data.forEach(metric => {
            const sessionDate = new Date(metric.start_time * 1000);
            
            csvData += [
              sessionDate.toDateString(),
              metric.sleep_score,
              metric.efficiency_score,
              metric.duration_score,
              metric.deep_sleep_percentage,
              metric.rem_sleep_percentage,
              metric.light_sleep_percentage,
              metric.awake_percentage
            ].join(',') + '\n';
          });
          break;
        }
      }

      return { success: true, data: csvData };

    } catch (error) {
      console.error('[DataService] CSV export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === DATA IMPORT ===

  /**
   * Import user data from JSON format
   */
  async importUserData(
    exportData: ExportData,
    options: ImportOptions = {
      replaceExisting: false,
      preserveIds: false,
      skipInvalid: true
    }
  ): Promise<DatabaseResult<{
    imported: number;
    skipped: number;
    errors: string[];
  }>> {
    try {
      console.log('[DataService] Starting data import...');

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Import preferences
      try {
        if (options.replaceExisting) {
          await database.executeUpdate('DELETE FROM user_preferences WHERE id = ?', [exportData.userId]);
        }

        const prefRow = exportData.preferences;
        await database.executeUpdate(`
          INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO user_preferences (
            id, theme, language, timezone, temperature_unit, time_format, date_format,
            bedtime_reminder, bedtime_reminder_time, wake_alarm, weekly_insights,
            goal_achievements, sleep_quality_alerts, share_data, anonymous_analytics,
            health_kit_integration, google_fit_integration, data_retention_period
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          exportData.userId,
          prefRow.theme, prefRow.language, prefRow.timezone,
          prefRow.temperature_unit, prefRow.time_format, prefRow.date_format,
          prefRow.bedtime_reminder, prefRow.bedtime_reminder_time, prefRow.wake_alarm,
          prefRow.weekly_insights, prefRow.goal_achievements, prefRow.sleep_quality_alerts,
          prefRow.share_data, prefRow.anonymous_analytics, prefRow.health_kit_integration,
          prefRow.google_fit_integration, prefRow.data_retention_period
        ]);
        imported++;
      } catch (error) {
        errors.push(`Preferences import failed: ${error}`);
        if (!options.skipInvalid) throw error;
      }

      // Import health profile
      try {
        if (options.replaceExisting) {
          await database.executeUpdate('DELETE FROM health_profile WHERE id = ?', [exportData.userId]);
        }

        const healthRow = exportData.healthProfile;
        await database.executeUpdate(`
          INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO health_profile (
            id, age, gender, weight, height, activity_level, chronic_conditions
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          exportData.userId,
          healthRow.age, healthRow.gender, healthRow.weight,
          healthRow.height, healthRow.activity_level, healthRow.chronic_conditions
        ]);
        imported++;
      } catch (error) {
        errors.push(`Health profile import failed: ${error}`);
        if (!options.skipInvalid) throw error;
      }

      // Import sleep sessions
      for (const session of exportData.sessions) {
        try {
          const sessionId = options.preserveIds ? session.id : generateId();
          
          await database.executeUpdate(`
            INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO sleep_sessions (
              id, user_id, start_time, end_time, duration, quality_overall,
              quality_efficiency, quality_restfulness, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            sessionId, session.user_id, session.start_time, session.end_time,
            session.duration, session.quality_overall, session.quality_efficiency,
            session.quality_restfulness, session.notes, session.created_at, session.updated_at
          ]);

          // Import related stages and metrics
          const relatedStages = exportData.stages.filter(s => s.session_id === session.id);
          const relatedMetrics = exportData.metrics.filter(m => m.session_id === session.id);

          for (const stage of relatedStages) {
            await database.executeUpdate(`
              INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO sleep_stages (
                id, session_id, stage, start_time, end_time, duration, sequence_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              options.preserveIds ? stage.id : generateId(),
              sessionId, stage.stage, stage.start_time, stage.end_time,
              stage.duration, stage.sequence_order
            ]);
          }

          for (const metric of relatedMetrics) {
            await database.executeUpdate(`
              INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO sleep_metrics (
                id, session_id, sleep_score, efficiency_score, duration_score,
                consistency_score, restoration_score, deep_sleep_percentage,
                rem_sleep_percentage, light_sleep_percentage, awake_percentage
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              options.preserveIds ? metric.id : generateId(),
              sessionId, metric.sleep_score, metric.efficiency_score, metric.duration_score,
              metric.consistency_score, metric.restoration_score, metric.deep_sleep_percentage,
              metric.rem_sleep_percentage, metric.light_sleep_percentage, metric.awake_percentage
            ]);
          }

          imported++;
        } catch (error) {
          errors.push(`Session ${session.id} import failed: ${error}`);
          skipped++;
          if (!options.skipInvalid) throw error;
        }
      }

      // Import goals and insights
      for (const goal of exportData.goals) {
        try {
          await database.executeUpdate(`
            INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO sleep_goals (
              id, user_id, target_bedtime, target_wake_time, target_duration,
              target_quality, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            options.preserveIds ? goal.id : generateId(),
            goal.user_id, goal.target_bedtime, goal.target_wake_time,
            goal.target_duration, goal.target_quality, goal.is_active,
            goal.created_at, goal.updated_at
          ]);
          imported++;
        } catch (error) {
          errors.push(`Goal ${goal.id} import failed: ${error}`);
          skipped++;
          if (!options.skipInvalid) throw error;
        }
      }

      // Import AI interactions if included
      if (exportData.aiInteractions) {
        for (const interaction of exportData.aiInteractions) {
          try {
            await database.executeUpdate(`
              INSERT OR ${options.replaceExisting ? 'REPLACE' : 'IGNORE'} INTO ai_interactions (
                id, user_id, conversation_id, type, content, metadata,
                context_session_ids, rating, is_helpful, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              options.preserveIds ? interaction.id : generateId(),
              interaction.user_id, interaction.conversation_id, interaction.type,
              interaction.content, interaction.metadata, interaction.context_session_ids,
              interaction.rating, interaction.is_helpful, interaction.created_at
            ]);
            imported++;
          } catch (error) {
            errors.push(`AI interaction ${interaction.id} import failed: ${error}`);
            skipped++;
            if (!options.skipInvalid) throw error;
          }
        }
      }

      console.log('[DataService] Import completed:', { imported, skipped, errors: errors.length });

      return {
        success: true,
        data: { imported, skipped, errors }
      };

    } catch (error) {
      console.error('[DataService] Import failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === DATA CLEANUP ===

  /**
   * Clean up old data based on retention policies
   */
  async cleanupOldData(
    userId: string = 'default_user',
    options: CleanupOptions = {
      retentionDays: 730,
      cleanupInsights: true,
      cleanupAIHistory: true,
      vacuum: true
    }
  ): Promise<DatabaseResult<{
    sessionsDeleted: number;
    insightsDeleted: number;
    aiInteractionsDeleted: number;
  }>> {
    try {
      console.log('[DataService] Starting data cleanup...');

      const cutoffTimestamp = Math.floor((Date.now() - options.retentionDays * 24 * 60 * 60 * 1000) / 1000);
      
      let sessionsDeleted = 0;
      let insightsDeleted = 0;
      let aiInteractionsDeleted = 0;

      // Clean up old sleep sessions (cascades to stages and metrics)
      const sessionsResult = await database.executeUpdate(`
        DELETE FROM sleep_sessions 
        WHERE user_id = ? AND created_at < ?
      `, [userId, cutoffTimestamp]);
      
      if (sessionsResult.success) {
        sessionsDeleted = sessionsResult.rowsAffected || 0;
      }

      // Clean up expired insights
      if (options.cleanupInsights) {
        const insightsResult = await database.executeUpdate(`
          DELETE FROM sleep_insights 
          WHERE user_id = ? AND (
            expires_at IS NOT NULL AND expires_at <= ? OR
            created_at < ?
          )
        `, [userId, Math.floor(Date.now() / 1000), cutoffTimestamp]);
        
        if (insightsResult.success) {
          insightsDeleted = insightsResult.rowsAffected || 0;
        }
      }

      // Clean up old AI history
      if (options.cleanupAIHistory) {
        const aiResult = await database.executeUpdate(`
          DELETE FROM ai_interactions 
          WHERE user_id = ? AND created_at < ?
        `, [userId, cutoffTimestamp]);
        
        if (aiResult.success) {
          aiInteractionsDeleted = aiResult.rowsAffected || 0;
        }
      }

      // Vacuum database to reclaim space
      if (options.vacuum) {
        await database.vacuum();
      }

      console.log('[DataService] Cleanup completed:', {
        sessionsDeleted,
        insightsDeleted,
        aiInteractionsDeleted
      });

      return {
        success: true,
        data: {
          sessionsDeleted,
          insightsDeleted,
          aiInteractionsDeleted
        }
      };

    } catch (error) {
      console.error('[DataService] Cleanup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === DATABASE STATISTICS ===

  /**
   * Get comprehensive database statistics
   */
  async getDatabaseStats(userId: string = 'default_user'): Promise<DatabaseResult<DatabaseStats>> {
    try {
      const stats = await database.getStats();
      if (!stats.success) {
        return stats;
      }

      // Get user-specific stats
      const [oldestResult, newestResult] = await Promise.all([
        database.executeQueryFirst<{ start_time: number }>(`
          SELECT MIN(start_time) as start_time FROM sleep_sessions WHERE user_id = ?
        `, [userId]),
        database.executeQueryFirst<{ start_time: number }>(`
          SELECT MAX(start_time) as start_time FROM sleep_sessions WHERE user_id = ?
        `, [userId])
      ]);

      const databaseStats: DatabaseStats = {
        ...stats.data,
        oldestSession: oldestResult.data?.start_time 
          ? new Date(oldestResult.data.start_time * 1000) 
          : undefined,
        newestSession: newestResult.data?.start_time 
          ? new Date(newestResult.data.start_time * 1000) 
          : undefined
      };

      return { success: true, data: databaseStats };

    } catch (error) {
      console.error('[DataService] Failed to get database stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === BACKUP & RESTORE ===

  /**
   * Create a database backup
   */
  async createBackup(userId: string = 'default_user'): Promise<DatabaseResult<BackupInfo>> {
    try {
      const exportResult = await this.exportUserData(userId, true);
      if (!exportResult.success || !exportResult.data) {
        return { success: false, error: exportResult.error };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `lunar-backup-${userId}-${timestamp}.json`;
      const backupData = JSON.stringify(exportResult.data, null, 2);
      
      // Calculate simple checksum
      const checksum = this.calculateChecksum(backupData);

      const backupInfo: BackupInfo = {
        filename,
        path: filename, // In a real app, this would be a full path
        size: backupData.length,
        createdAt: new Date(),
        checksum
      };

      return {
        success: true,
        data: backupInfo
      };

    } catch (error) {
      console.error('[DataService] Backup creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(
    backupData: string,
    options: ImportOptions = { replaceExisting: true, preserveIds: true, skipInvalid: false }
  ): Promise<DatabaseResult<{ imported: number; skipped: number; errors: string[] }>> {
    try {
      const exportData: ExportData = JSON.parse(backupData);
      
      // Validate backup data
      if (!exportData.version || !exportData.userId) {
        return {
          success: false,
          error: 'Invalid backup data format'
        };
      }

      return this.importUserData(exportData, options);

    } catch (error) {
      console.error('[DataService] Restore failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Calculate simple checksum for data integrity
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    if (data.length === 0) return hash.toString();
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity(): Promise<DatabaseResult<{
    isValid: boolean;
    issues: string[];
  }>> {
    try {
      const issues: string[] = [];

      // Check for orphaned stages
      const orphanedStagesResult = await database.executeQuery(`
        SELECT COUNT(*) as count FROM sleep_stages 
        WHERE session_id NOT IN (SELECT id FROM sleep_sessions)
      `);
      
      if (orphanedStagesResult.success && orphanedStagesResult.data?.[0]?.count > 0) {
        issues.push(`Found ${orphanedStagesResult.data[0].count} orphaned sleep stages`);
      }

      // Check for orphaned metrics
      const orphanedMetricsResult = await database.executeQuery(`
        SELECT COUNT(*) as count FROM sleep_metrics 
        WHERE session_id NOT IN (SELECT id FROM sleep_sessions)
      `);
      
      if (orphanedMetricsResult.success && orphanedMetricsResult.data?.[0]?.count > 0) {
        issues.push(`Found ${orphanedMetricsResult.data[0].count} orphaned sleep metrics`);
      }

      // Check for sessions with invalid durations
      const invalidDurationsResult = await database.executeQuery(`
        SELECT COUNT(*) as count FROM sleep_sessions 
        WHERE duration <= 0 OR duration > 1440
      `);
      
      if (invalidDurationsResult.success && invalidDurationsResult.data?.[0]?.count > 0) {
        issues.push(`Found ${invalidDurationsResult.data[0].count} sessions with invalid durations`);
      }

      return {
        success: true,
        data: {
          isValid: issues.length === 0,
          issues
        }
      };

    } catch (error) {
      console.error('[DataService] Data validation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Repair data integrity issues
   */
  async repairDataIntegrity(): Promise<DatabaseResult<{
    repaired: number;
    issues: string[];
  }>> {
    try {
      let repaired = 0;
      const issues: string[] = [];

      // Remove orphaned stages
      const orphanedStagesResult = await database.executeUpdate(`
        DELETE FROM sleep_stages 
        WHERE session_id NOT IN (SELECT id FROM sleep_sessions)
      `);
      
      if (orphanedStagesResult.success && (orphanedStagesResult.rowsAffected || 0) > 0) {
        repaired += orphanedStagesResult.rowsAffected || 0;
        issues.push(`Removed ${orphanedStagesResult.rowsAffected} orphaned sleep stages`);
      }

      // Remove orphaned metrics
      const orphanedMetricsResult = await database.executeUpdate(`
        DELETE FROM sleep_metrics 
        WHERE session_id NOT IN (SELECT id FROM sleep_sessions)
      `);
      
      if (orphanedMetricsResult.success && (orphanedMetricsResult.rowsAffected || 0) > 0) {
        repaired += orphanedMetricsResult.rowsAffected || 0;
        issues.push(`Removed ${orphanedMetricsResult.rowsAffected} orphaned sleep metrics`);
      }

      // Fix invalid durations (set to reasonable defaults)
      const invalidDurationsResult = await database.executeUpdate(`
        UPDATE sleep_sessions 
        SET duration = ABS(CAST((end_time - start_time) / 60 AS INTEGER))
        WHERE duration <= 0 OR duration > 1440
      `);
      
      if (invalidDurationsResult.success && (invalidDurationsResult.rowsAffected || 0) > 0) {
        repaired += invalidDurationsResult.rowsAffected || 0;
        issues.push(`Fixed ${invalidDurationsResult.rowsAffected} sessions with invalid durations`);
      }

      return {
        success: true,
        data: { repaired, issues }
      };

    } catch (error) {
      console.error('[DataService] Data repair failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();