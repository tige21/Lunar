/**
 * Health Database Integration Service for Lunar Sleep Analysis App
 * Connects health data services with the local SQLite database
 */

import {
  ProcessedSleepSession,
  ProcessedSleepStage,
  ProcessedHeartRateData,
  HealthDataImportResult,
  DataConflict,
  ConflictResolution,
  HealthInsight,
} from './types';

import {
  SleepSessionRow,
  SleepStageRow,
  HeartRateDataRow,
  SleepMetricsRow,
  SleepInsightRow,
  DatabaseResult,
} from '../database/types';

import { SleepService } from '../database/sleepService';
import { DataService } from '../database/dataService';
import { DATABASE_CONFIG } from '../database/schema';

/**
 * Integration service that bridges health data and database storage
 */
export class HealthDatabaseIntegration {
  private sleepService: SleepService;
  private dataService: DataService;

  constructor() {
    this.sleepService = new SleepService();
    this.dataService = new DataService();
  }

  /**
   * Import processed health sessions into the database
   */
  async importHealthSessions(
    sessions: ProcessedSleepSession[],
    userId: string,
    options: {
      resolveConflicts?: boolean;
      skipDuplicates?: boolean;
      updateExisting?: boolean;
    } = {}
  ): Promise<HealthDataImportResult> {
    const startTime = Date.now();
    const result: HealthDataImportResult = {
      success: false,
      sessionsImported: 0,
      sessionsSkipped: 0,
      conflictsFound: 0,
      conflictsResolved: 0,
      errors: [],
      warnings: [],
      processingTime: 0,
    };

    try {
      for (const session of sessions) {
        try {
          // Check for existing session conflicts
          const existingSession = await this.findExistingSessions(session, userId);
          
          if (existingSession.length > 0) {
            result.conflictsFound++;
            
            if (!options.resolveConflicts) {
              result.sessionsSkipped++;
              result.warnings.push(`Skipped session ${session.sessionId} due to conflict`);
              continue;
            }

            // Handle conflict resolution
            const shouldUpdate = await this.resolveSessionConflict(session, existingSession[0], options);
            if (!shouldUpdate) {
              result.sessionsSkipped++;
              continue;
            }

            result.conflictsResolved++;
          }

          // Convert and save session
          const sessionResult = await this.saveHealthSession(session, userId);
          if (sessionResult.success) {
            result.sessionsImported++;
          } else {
            result.errors.push(`Failed to save session ${session.sessionId}: ${sessionResult.error}`);
          }

        } catch (error) {
          result.errors.push(`Error processing session ${session.sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0 || result.sessionsImported > 0;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Save a single health session to the database
   */
  async saveHealthSession(session: ProcessedSleepSession, userId: string): Promise<DatabaseResult> {
    try {
      // Convert to database format
      const sessionRow = this.convertToSleepSessionRow(session, userId);
      const stageRows = this.convertToSleepStageRows(session.stages, session.sessionId);
      const metricsRow = this.convertToSleepMetricsRow(session);
      const heartRateRows = this.convertToHeartRateRows(session.heartRateData || [], session.sessionId);

      // Save session
      const sessionResult = await this.sleepService.createSession(sessionRow);
      if (!sessionResult.success) {
        return sessionResult;
      }

      // Save stages
      for (const stage of stageRows) {
        const stageResult = await this.sleepService.createStage(stage);
        if (!stageResult.success) {
          console.warn(`Failed to save stage: ${stageResult.error}`);
        }
      }

      // Save metrics
      if (metricsRow) {
        const metricsResult = await this.sleepService.createMetrics(metricsRow);
        if (!metricsResult.success) {
          console.warn(`Failed to save metrics: ${metricsResult.error}`);
        }
      }

      // Save heart rate data
      for (const heartRate of heartRateRows) {
        const hrResult = await this.sleepService.createHeartRateData(heartRate);
        if (!hrResult.success) {
          console.warn(`Failed to save heart rate data: ${hrResult.error}`);
        }
      }

      return { success: true, data: sessionRow };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find existing sessions that might conflict with the new session
   */
  async findExistingSessions(session: ProcessedSleepSession, userId: string): Promise<SleepSessionRow[]> {
    try {
      // Look for sessions that overlap with the new session time range
      const startTime = session.startTime.getTime();
      const endTime = session.endTime.getTime();
      
      // Query sessions that overlap (start before new session ends, end after new session starts)
      const query = `
        SELECT * FROM sleep_sessions 
        WHERE user_id = ? 
        AND start_time < ? 
        AND end_time > ?
      `;
      
      const result = await this.dataService.query(query, [userId, endTime, startTime]);
      return result.success ? (result.data as SleepSessionRow[]) : [];
    } catch (error) {
      console.error('Error finding existing sessions:', error);
      return [];
    }
  }

  /**
   * Resolve conflicts between existing and new sessions
   */
  async resolveSessionConflict(
    newSession: ProcessedSleepSession,
    existingSession: SleepSessionRow,
    options: { updateExisting?: boolean; skipDuplicates?: boolean }
  ): Promise<boolean> {
    // Calculate overlap percentage
    const newStart = newSession.startTime.getTime();
    const newEnd = newSession.endTime.getTime();
    const existingStart = existingSession.start_time;
    const existingEnd = existingSession.end_time;

    const overlapStart = Math.max(newStart, existingStart);
    const overlapEnd = Math.min(newEnd, existingEnd);
    const overlapDuration = Math.max(0, overlapEnd - overlapStart);
    
    const newDuration = newEnd - newStart;
    const existingDuration = existingEnd - existingStart;
    const overlapPercentage = overlapDuration / Math.min(newDuration, existingDuration);

    // If 90%+ overlap, consider it the same session
    if (overlapPercentage > 0.9) {
      if (options.skipDuplicates) {
        return false; // Skip this session
      }
      
      if (options.updateExisting) {
        // Delete the existing session to replace with new one
        await this.deleteSession(existingSession.id);
        return true;
      }
    }

    // For partial overlaps, prefer to update if the new session has more data
    const hasMoreData = (newSession.stages.length > 0) || (newSession.heartRateData && newSession.heartRateData.length > 0);
    if (hasMoreData && options.updateExisting) {
      await this.deleteSession(existingSession.id);
      return true;
    }

    return false; // Skip by default
  }

  /**
   * Delete a session and all related data
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Delete in correct order to maintain referential integrity
      await this.dataService.query('DELETE FROM heart_rate_data WHERE session_id = ?', [sessionId]);
      await this.dataService.query('DELETE FROM sleep_metrics WHERE session_id = ?', [sessionId]);
      await this.dataService.query('DELETE FROM sleep_stages WHERE session_id = ?', [sessionId]);
      await this.dataService.query('DELETE FROM quality_factors WHERE session_id = ?', [sessionId]);
      await this.dataService.query('DELETE FROM sleep_sessions WHERE id = ?', [sessionId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Import health insights into the database
   */
  async importHealthInsights(insights: HealthInsight[], userId: string): Promise<number> {
    let importedCount = 0;

    for (const insight of insights) {
      try {
        const insightRow = this.convertToSleepInsightRow(insight, userId);
        const result = await this.sleepService.createInsight(insightRow);
        
        if (result.success) {
          importedCount++;
        }
      } catch (error) {
        console.error('Error importing insight:', error);
      }
    }

    return importedCount;
  }

  /**
   * Get health data statistics for quality assessment
   */
  async getHealthDataStatistics(userId: string, days: number = 30): Promise<{
    totalSessions: number;
    averageQuality: number;
    dataCompleteness: number;
    lastSyncTime?: Date;
    sourcesUsed: string[];
  }> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);

      // Get session statistics
      const sessionQuery = `
        SELECT 
          COUNT(*) as total_sessions,
          AVG(quality_overall) as avg_quality,
          MIN(created_at) as first_session,
          MAX(created_at) as last_session
        FROM sleep_sessions 
        WHERE user_id = ? 
        AND start_time >= ? 
        AND start_time <= ?
      `;

      const sessionResult = await this.dataService.query(sessionQuery, [userId, startTime, endTime]);
      const stats = sessionResult.data?.[0] || { total_sessions: 0, avg_quality: 0 };

      // Calculate data completeness (sessions per expected days)
      const expectedSessions = days;
      const dataCompleteness = Math.min(100, (stats.total_sessions / expectedSessions) * 100);

      // Get unique data sources (would need to be stored in metadata)
      const sourcesQuery = `
        SELECT DISTINCT notes 
        FROM sleep_sessions 
        WHERE user_id = ? 
        AND notes LIKE '%source:%'
        AND start_time >= ?
      `;

      const sourcesResult = await this.dataService.query(sourcesQuery, [userId, startTime]);
      const sourcesUsed = sourcesResult.data?.map((row: any) => 
        row.notes?.match(/source:([^,]+)/)?.[1] || 'Unknown'
      ).filter(Boolean) || [];

      return {
        totalSessions: stats.total_sessions || 0,
        averageQuality: stats.avg_quality || 0,
        dataCompleteness,
        lastSyncTime: stats.last_session ? new Date(stats.last_session) : undefined,
        sourcesUsed: [...new Set(sourcesUsed)], // Remove duplicates
      };
    } catch (error) {
      console.error('Error getting health data statistics:', error);
      return {
        totalSessions: 0,
        averageQuality: 0,
        dataCompleteness: 0,
        sourcesUsed: [],
      };
    }
  }

  // Private conversion methods

  private convertToSleepSessionRow(session: ProcessedSleepSession, userId: string): SleepSessionRow {
    const now = Date.now();
    
    return {
      id: session.sessionId,
      user_id: userId,
      start_time: session.startTime.getTime(),
      end_time: session.endTime.getTime(),
      duration: session.duration,
      quality_overall: session.quality.overall,
      quality_efficiency: session.quality.efficiency,
      quality_restfulness: session.quality.restfulness,
      heart_rate_avg: this.calculateAverageHeartRate(session.heartRateData),
      heart_rate_min: this.calculateMinHeartRate(session.heartRateData),
      heart_rate_max: this.calculateMaxHeartRate(session.heartRateData),
      heart_rate_variability: this.calculateAverageHRV(session.heartRateData),
      notes: `Imported from ${session.source.name} (${session.source.bundleIdentifier})`,
      created_at: now,
      updated_at: now,
    };
  }

  private convertToSleepStageRows(stages: ProcessedSleepStage[], sessionId: string): SleepStageRow[] {
    const now = Date.now();
    
    return stages.map(stage => ({
      id: `${sessionId}_stage_${stage.sequenceOrder}`,
      session_id: sessionId,
      stage: stage.stage,
      start_time: stage.startTime.getTime(),
      end_time: stage.endTime.getTime(),
      duration: stage.duration,
      sequence_order: stage.sequenceOrder,
      created_at: now,
    }));
  }

  private convertToSleepMetricsRow(session: ProcessedSleepSession): SleepMetricsRow {
    const now = Date.now();
    const stagePercentages = this.calculateStagePercentages(session.stages, session.duration);
    
    return {
      id: `${session.sessionId}_metrics`,
      session_id: session.sessionId,
      sleep_score: session.quality.overall,
      efficiency_score: session.quality.efficiency,
      duration_score: this.calculateDurationScore(session.duration),
      consistency_score: 75, // Would need historical data to calculate properly
      restoration_score: session.quality.restfulness,
      deep_sleep_percentage: stagePercentages.deep,
      rem_sleep_percentage: stagePercentages.rem,
      light_sleep_percentage: stagePercentages.light,
      awake_percentage: stagePercentages.awake,
      sleep_latency: this.calculateSleepLatency(session.stages),
      wake_after_sleep_onset: this.calculateWakeAfterSleepOnset(session.stages),
      number_of_awakenings: this.countAwakenings(session.stages),
      created_at: now,
    };
  }

  private convertToHeartRateRows(heartRateData: ProcessedHeartRateData[], sessionId: string): HeartRateDataRow[] {
    const now = Date.now();
    
    return heartRateData.map((reading, index) => ({
      id: `${sessionId}_hr_${index}`,
      session_id: sessionId,
      timestamp: reading.timestamp.getTime(),
      bpm: reading.bpm,
      variability: reading.variability,
      created_at: now,
    }));
  }

  private convertToSleepInsightRow(insight: HealthInsight, userId: string): SleepInsightRow {
    const now = Date.now();
    
    return {
      id: insight.id,
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      actionable: insight.actionable,
      action_text: insight.suggestedAction,
      priority: insight.priority,
      is_read: false,
      expires_at: insight.expiresAt?.getTime(),
      created_at: now,
    };
  }

  // Helper calculation methods

  private calculateAverageHeartRate(heartRateData?: ProcessedHeartRateData[]): number | undefined {
    if (!heartRateData || heartRateData.length === 0) return undefined;
    const sum = heartRateData.reduce((total, reading) => total + reading.bpm, 0);
    return Math.round(sum / heartRateData.length);
  }

  private calculateMinHeartRate(heartRateData?: ProcessedHeartRateData[]): number | undefined {
    if (!heartRateData || heartRateData.length === 0) return undefined;
    return Math.min(...heartRateData.map(reading => reading.bpm));
  }

  private calculateMaxHeartRate(heartRateData?: ProcessedHeartRateData[]): number | undefined {
    if (!heartRateData || heartRateData.length === 0) return undefined;
    return Math.max(...heartRateData.map(reading => reading.bpm));
  }

  private calculateAverageHRV(heartRateData?: ProcessedHeartRateData[]): number | undefined {
    if (!heartRateData || heartRateData.length === 0) return undefined;
    const validHRV = heartRateData.filter(reading => reading.variability !== undefined);
    if (validHRV.length === 0) return undefined;
    
    const sum = validHRV.reduce((total, reading) => total + (reading.variability || 0), 0);
    return Math.round(sum / validHRV.length);
  }

  private calculateStagePercentages(stages: ProcessedSleepStage[], totalDuration: number): {
    deep: number;
    rem: number;
    light: number;
    awake: number;
  } {
    const stageTotals = { deep: 0, rem: 0, light: 0, awake: 0 };
    
    stages.forEach(stage => {
      stageTotals[stage.stage] += stage.duration;
    });

    return {
      deep: (stageTotals.deep / totalDuration) * 100,
      rem: (stageTotals.rem / totalDuration) * 100,
      light: (stageTotals.light / totalDuration) * 100,
      awake: (stageTotals.awake / totalDuration) * 100,
    };
  }

  private calculateDurationScore(duration: number): number {
    const optimalDuration = 8 * 60; // 8 hours in minutes
    const deviation = Math.abs(duration - optimalDuration);
    const maxDeviation = 4 * 60; // 4 hours
    
    return Math.max(0, 100 - (deviation / maxDeviation) * 100);
  }

  private calculateSleepLatency(stages: ProcessedSleepStage[]): number | undefined {
    // Find the first non-awake stage
    const firstSleepStage = stages.find(stage => stage.stage !== 'awake');
    if (!firstSleepStage || stages.length === 0) return undefined;
    
    const sessionStart = Math.min(...stages.map(stage => stage.startTime.getTime()));
    const firstSleepTime = firstSleepStage.startTime.getTime();
    
    return Math.max(0, (firstSleepTime - sessionStart) / (1000 * 60)); // minutes
  }

  private calculateWakeAfterSleepOnset(stages: ProcessedSleepStage[]): number | undefined {
    const firstSleepStage = stages.find(stage => stage.stage !== 'awake');
    if (!firstSleepStage) return undefined;
    
    const sleepOnset = firstSleepStage.startTime.getTime();
    const awakeStagesAfterOnset = stages.filter(stage => 
      stage.stage === 'awake' && stage.startTime.getTime() > sleepOnset
    );
    
    return awakeStagesAfterOnset.reduce((total, stage) => total + stage.duration, 0);
  }

  private countAwakenings(stages: ProcessedSleepStage[]): number {
    let awakenings = 0;
    let wasAsleep = false;
    
    stages.forEach(stage => {
      if (stage.stage !== 'awake' && !wasAsleep) {
        wasAsleep = true;
      } else if (stage.stage === 'awake' && wasAsleep) {
        awakenings++;
      }
    });
    
    return awakenings;
  }
}