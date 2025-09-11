/**
 * Sleep-specific database operations for Lunar Sleep Analysis App
 * Handles all sleep session, stage, and metrics CRUD operations
 */

import { database } from './database';
import type {
  SleepSessionRow,
  SleepStageRow,
  SleepMetricsRow,
  QualityFactorRow,
  HeartRateDataRow,
  DatabaseResult,
  SleepSessionFilter,
  QueryOptions,
  BulkInsertResult,
  SleepTrendData,
  SleepStageAnalysis,
  SleepQualityAnalysis
} from './types';
import type { SleepSession, SleepStage, SleepQuality, QualityFactor } from '../../types/sleep';
import { generateId } from '../utils/id';

export class SleepService {
  private static instance: SleepService;

  private constructor() {}

  public static getInstance(): SleepService {
    if (!SleepService.instance) {
      SleepService.instance = new SleepService();
    }
    return SleepService.instance;
  }

  // === SLEEP SESSIONS ===

  /**
   * Create a new sleep session
   */
  async createSession(
    session: Omit<SleepSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DatabaseResult<string>> {
    try {
      const id = generateId();
      const now = Math.floor(Date.now() / 1000);
      
      // Convert quality scores from 1-10 to 0-100 scale
      const qualityOverall = Math.round((session.quality.overall - 1) * (100 / 9));
      const qualityRestfulness = Math.round((session.quality.restfulness - 1) * (100 / 9));

      const result = await database.executeUpdate(`
        INSERT INTO sleep_sessions (
          id, user_id, start_time, end_time, duration,
          quality_overall, quality_efficiency, quality_restfulness,
          heart_rate_avg, heart_rate_min, heart_rate_max, heart_rate_variability,
          environment_temperature, environment_humidity, environment_noise_level, environment_light_level,
          notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        session.userId,
        Math.floor(session.startTime.getTime() / 1000),
        Math.floor(session.endTime.getTime() / 1000),
        session.duration,
        qualityOverall,
        session.quality.efficiency,
        qualityRestfulness,
        session.heartRate?.[0]?.bpm, // avg (simplified for schema)
        session.heartRate?.reduce((min, hr) => Math.min(min, hr.bpm), Infinity) || null,
        session.heartRate?.reduce((max, hr) => Math.max(max, hr.bpm), 0) || null,
        session.heartRate?.[0]?.variability || null,
        session.environment?.temperature,
        session.environment?.humidity,
        session.environment?.noiseLevel,
        session.environment?.lightLevel,
        session.notes,
        now,
        now
      ]);

      if (!result.success) {
        return result;
      }

      // Insert sleep stages
      if (session.stages && session.stages.length > 0) {
        await this.createStages(id, session.stages);
      }

      // Insert quality factors
      if (session.quality.factors && session.quality.factors.length > 0) {
        await this.createQualityFactors(id, session.quality.factors);
      }

      // Insert detailed heart rate data
      if (session.heartRate && session.heartRate.length > 0) {
        await this.createHeartRateData(id, session.heartRate);
      }

      // Calculate and store metrics
      await this.calculateAndStoreMetrics(id, session);

      return {
        success: true,
        data: id
      };

    } catch (error) {
      console.error('[SleepService] Failed to create session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get sleep session by ID
   */
  async getSession(sessionId: string): Promise<DatabaseResult<SleepSession | null>> {
    try {
      const sessionResult = await database.executeQueryFirst<SleepSessionRow>(`
        SELECT * FROM sleep_sessions WHERE id = ?
      `, [sessionId]);

      if (!sessionResult.success || !sessionResult.data) {
        return { success: true, data: null };
      }

      const session = await this.mapRowToSession(sessionResult.data);
      return { success: true, data: session };

    } catch (error) {
      console.error('[SleepService] Failed to get session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get sleep sessions with filters and pagination
   */
  async getSessions(
    filter: SleepSessionFilter = {},
    options: QueryOptions = {}
  ): Promise<DatabaseResult<SleepSession[]>> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      // Build WHERE clause
      if (filter.userId) {
        whereClause += ' AND user_id = ?';
        params.push(filter.userId);
      }

      if (filter.startDate) {
        whereClause += ' AND start_time >= ?';
        params.push(Math.floor(filter.startDate.getTime() / 1000));
      }

      if (filter.endDate) {
        whereClause += ' AND end_time <= ?';
        params.push(Math.floor(filter.endDate.getTime() / 1000));
      }

      if (filter.minQuality !== undefined) {
        whereClause += ' AND quality_overall >= ?';
        params.push(filter.minQuality);
      }

      if (filter.maxQuality !== undefined) {
        whereClause += ' AND quality_overall <= ?';
        params.push(filter.maxQuality);
      }

      if (filter.minDuration !== undefined) {
        whereClause += ' AND duration >= ?';
        params.push(filter.minDuration);
      }

      if (filter.maxDuration !== undefined) {
        whereClause += ' AND duration <= ?';
        params.push(filter.maxDuration);
      }

      // Build ORDER BY clause
      const orderBy = options.orderBy || 'start_time';
      const orderDirection = options.orderDirection || 'DESC';
      
      // Build LIMIT/OFFSET clause
      let limitClause = '';
      if (options.limit) {
        limitClause += ` LIMIT ${options.limit}`;
        if (options.offset) {
          limitClause += ` OFFSET ${options.offset}`;
        }
      }

      const sql = `
        SELECT * FROM sleep_sessions 
        ${whereClause} 
        ORDER BY ${orderBy} ${orderDirection}
        ${limitClause}
      `;

      const result = await database.executeQuery<SleepSessionRow>(sql, params);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      // Map rows to sessions (including related data)
      const sessions = await Promise.all(
        result.data.map(row => this.mapRowToSession(row))
      );

      return { success: true, data: sessions };

    } catch (error) {
      console.error('[SleepService] Failed to get sessions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a sleep session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<SleepSession, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DatabaseResult<void>> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];

      // Build SET clause dynamically
      if (updates.startTime) {
        setClauses.push('start_time = ?');
        params.push(Math.floor(updates.startTime.getTime() / 1000));
      }

      if (updates.endTime) {
        setClauses.push('end_time = ?');
        params.push(Math.floor(updates.endTime.getTime() / 1000));
      }

      if (updates.duration !== undefined) {
        setClauses.push('duration = ?');
        params.push(updates.duration);
      }

      if (updates.quality) {
        if (updates.quality.overall !== undefined) {
          setClauses.push('quality_overall = ?');
          params.push(Math.round((updates.quality.overall - 1) * (100 / 9)));
        }
        if (updates.quality.efficiency !== undefined) {
          setClauses.push('quality_efficiency = ?');
          params.push(updates.quality.efficiency);
        }
        if (updates.quality.restfulness !== undefined) {
          setClauses.push('quality_restfulness = ?');
          params.push(Math.round((updates.quality.restfulness - 1) * (100 / 9)));
        }
      }

      if (updates.notes !== undefined) {
        setClauses.push('notes = ?');
        params.push(updates.notes);
      }

      if (setClauses.length === 0) {
        return { success: true };
      }

      params.push(sessionId);

      const result = await database.executeUpdate(`
        UPDATE sleep_sessions 
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `, params);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[SleepService] Failed to update session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a sleep session and all related data
   */
  async deleteSession(sessionId: string): Promise<DatabaseResult<void>> {
    try {
      // Foreign key constraints will handle cascading deletes
      const result = await database.executeUpdate(`
        DELETE FROM sleep_sessions WHERE id = ?
      `, [sessionId]);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[SleepService] Failed to delete session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SLEEP STAGES ===

  /**
   * Create sleep stages for a session
   */
  private async createStages(
    sessionId: string,
    stages: SleepStage[]
  ): Promise<DatabaseResult<void>> {
    try {
      const queries = stages.map((stage, index) => ({
        sql: `
          INSERT INTO sleep_stages (
            id, session_id, stage, start_time, end_time, duration, sequence_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          stage.id || generateId(),
          sessionId,
          stage.stage,
          Math.floor(stage.startTime.getTime() / 1000),
          Math.floor(stage.endTime.getTime() / 1000),
          stage.duration,
          index
        ]
      }));

      const result = await database.executeTransaction(queries);
      return result;

    } catch (error) {
      console.error('[SleepService] Failed to create stages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get sleep stages for a session
   */
  async getStages(sessionId: string): Promise<DatabaseResult<SleepStage[]>> {
    try {
      const result = await database.executeQuery<SleepStageRow>(`
        SELECT * FROM sleep_stages 
        WHERE session_id = ? 
        ORDER BY sequence_order ASC
      `, [sessionId]);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const stages: SleepStage[] = result.data.map(row => ({
        id: row.id,
        sessionId: row.session_id,
        stage: row.stage,
        startTime: new Date(row.start_time * 1000),
        endTime: new Date(row.end_time * 1000),
        duration: row.duration
      }));

      return { success: true, data: stages };

    } catch (error) {
      console.error('[SleepService] Failed to get stages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === QUALITY FACTORS ===

  /**
   * Create quality factors for a session
   */
  private async createQualityFactors(
    sessionId: string,
    factors: QualityFactor[]
  ): Promise<DatabaseResult<void>> {
    try {
      const queries = factors.map(factor => ({
        sql: `
          INSERT INTO quality_factors (
            id, session_id, type, impact, severity, description
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        params: [
          generateId(),
          sessionId,
          factor.type,
          factor.impact,
          factor.severity,
          factor.description || null
        ]
      }));

      const result = await database.executeTransaction(queries);
      return result;

    } catch (error) {
      console.error('[SleepService] Failed to create quality factors:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === HEART RATE DATA ===

  /**
   * Create heart rate data for a session
   */
  private async createHeartRateData(
    sessionId: string,
    heartRateData: Array<{ timestamp: Date; bpm: number; variability?: number }>
  ): Promise<DatabaseResult<void>> {
    try {
      const queries = heartRateData.map(hr => ({
        sql: `
          INSERT INTO heart_rate_data (
            id, session_id, timestamp, bpm, variability
          ) VALUES (?, ?, ?, ?, ?)
        `,
        params: [
          generateId(),
          sessionId,
          Math.floor(hr.timestamp.getTime() / 1000),
          hr.bpm,
          hr.variability || null
        ]
      }));

      const result = await database.executeTransaction(queries);
      return result;

    } catch (error) {
      console.error('[SleepService] Failed to create heart rate data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SLEEP METRICS ===

  /**
   * Calculate and store sleep metrics for a session
   */
  private async calculateAndStoreMetrics(
    sessionId: string,
    session: Omit<SleepSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DatabaseResult<void>> {
    try {
      const metrics = this.calculateSleepMetrics(session);
      
      const result = await database.executeUpdate(`
        INSERT INTO sleep_metrics (
          id, session_id, sleep_score, efficiency_score, duration_score,
          consistency_score, restoration_score, deep_sleep_percentage,
          rem_sleep_percentage, light_sleep_percentage, awake_percentage,
          sleep_latency, wake_after_sleep_onset, number_of_awakenings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        generateId(),
        sessionId,
        metrics.sleepScore,
        metrics.efficiencyScore,
        metrics.durationScore,
        metrics.consistencyScore,
        metrics.restorationScore,
        metrics.deepSleepPercentage,
        metrics.remSleepPercentage,
        metrics.lightSleepPercentage,
        metrics.awakePercentage,
        metrics.sleepLatency,
        metrics.wakeAfterSleepOnset,
        metrics.numberOfAwakenings
      ]);

      return result.success ? { success: true } : result;

    } catch (error) {
      console.error('[SleepService] Failed to store metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate sleep metrics from session data
   */
  private calculateSleepMetrics(
    session: Omit<SleepSession, 'id' | 'createdAt' | 'updatedAt'>
  ): {
    sleepScore: number;
    efficiencyScore: number;
    durationScore: number;
    consistencyScore: number;
    restorationScore: number;
    deepSleepPercentage: number;
    remSleepPercentage: number;
    lightSleepPercentage: number;
    awakePercentage: number;
    sleepLatency: number;
    wakeAfterSleepOnset: number;
    numberOfAwakenings: number;
  } {
    const totalDuration = session.duration;
    
    // Calculate stage percentages
    const stageMinutes = {
      deep: 0,
      rem: 0,
      light: 0,
      awake: 0
    };

    session.stages?.forEach(stage => {
      stageMinutes[stage.stage] += stage.duration;
    });

    const deepSleepPercentage = (stageMinutes.deep / totalDuration) * 100;
    const remSleepPercentage = (stageMinutes.rem / totalDuration) * 100;
    const lightSleepPercentage = (stageMinutes.light / totalDuration) * 100;
    const awakePercentage = (stageMinutes.awake / totalDuration) * 100;

    // Calculate sleep latency (time to first non-awake stage)
    const sleepLatency = session.stages?.find(stage => stage.stage !== 'awake')?.duration || 0;

    // Calculate wake after sleep onset
    const firstSleepIndex = session.stages?.findIndex(stage => stage.stage !== 'awake') || 0;
    const wakeAfterSleepOnset = session.stages
      ?.slice(firstSleepIndex)
      .filter(stage => stage.stage === 'awake')
      .reduce((total, stage) => total + stage.duration, 0) || 0;

    // Count awakenings
    const numberOfAwakenings = session.stages
      ?.filter(stage => stage.stage === 'awake').length || 0;

    // Calculate scores (0-100)
    const efficiencyScore = Math.round(session.quality.efficiency);
    const durationScore = Math.min(100, Math.round((totalDuration / 480) * 100)); // Target 8 hours
    const consistencyScore = 85; // Would be calculated from historical data
    const restorationScore = Math.round(((deepSleepPercentage + remSleepPercentage) / 40) * 100);

    // Overall sleep score (weighted average)
    const sleepScore = Math.round(
      (efficiencyScore * 0.3) +
      (durationScore * 0.2) +
      (restorationScore * 0.3) +
      (consistencyScore * 0.2)
    );

    return {
      sleepScore: Math.min(100, Math.max(0, sleepScore)),
      efficiencyScore,
      durationScore,
      consistencyScore,
      restorationScore,
      deepSleepPercentage: Math.round(deepSleepPercentage * 10) / 10,
      remSleepPercentage: Math.round(remSleepPercentage * 10) / 10,
      lightSleepPercentage: Math.round(lightSleepPercentage * 10) / 10,
      awakePercentage: Math.round(awakePercentage * 10) / 10,
      sleepLatency,
      wakeAfterSleepOnset,
      numberOfAwakenings
    };
  }

  /**
   * Get sleep metrics for a session
   */
  async getMetrics(sessionId: string): Promise<DatabaseResult<SleepMetricsRow | null>> {
    try {
      const result = await database.executeQueryFirst<SleepMetricsRow>(`
        SELECT * FROM sleep_metrics WHERE session_id = ?
      `, [sessionId]);

      return result;

    } catch (error) {
      console.error('[SleepService] Failed to get metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === ANALYTICS ===

  /**
   * Get sleep trends for a specific period
   */
  async getSleepTrends(
    userId: string,
    period: 'week' | 'month' | 'quarter' | 'year',
    endDate: Date = new Date()
  ): Promise<DatabaseResult<SleepTrendData>> {
    try {
      const periodDays = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
      };

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - periodDays[period]);

      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const result = await database.executeQueryFirst<{
        avg_duration: number;
        avg_quality: number;
        avg_efficiency: number;
        session_count: number;
      }>(`
        SELECT 
          AVG(duration) as avg_duration,
          AVG(quality_overall) as avg_quality,
          AVG(quality_efficiency) as avg_efficiency,
          COUNT(*) as session_count
        FROM sleep_sessions 
        WHERE user_id = ? AND start_time >= ? AND start_time <= ?
      `, [userId, startTimestamp, endTimestamp]);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      // Calculate average bedtime and wake time (simplified)
      const timeResult = await database.executeQuery<{ start_time: number; end_time: number }>(`
        SELECT start_time, end_time 
        FROM sleep_sessions 
        WHERE user_id = ? AND start_time >= ? AND start_time <= ?
        ORDER BY start_time DESC
      `, [userId, startTimestamp, endTimestamp]);

      let averageBedtime = '22:00';
      let averageWakeTime = '07:00';

      if (timeResult.success && timeResult.data) {
        // Calculate average times (simplified implementation)
        const bedtimes = timeResult.data.map(row => {
          const date = new Date(row.start_time * 1000);
          return date.getHours() + (date.getMinutes() / 60);
        });

        const wakeTimes = timeResult.data.map(row => {
          const date = new Date(row.end_time * 1000);
          return date.getHours() + (date.getMinutes() / 60);
        });

        if (bedtimes.length > 0) {
          const avgBedtimeHour = bedtimes.reduce((sum, hour) => sum + hour, 0) / bedtimes.length;
          const hours = Math.floor(avgBedtimeHour);
          const minutes = Math.round((avgBedtimeHour - hours) * 60);
          averageBedtime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        if (wakeTimes.length > 0) {
          const avgWakeTimeHour = wakeTimes.reduce((sum, hour) => sum + hour, 0) / wakeTimes.length;
          const hours = Math.floor(avgWakeTimeHour);
          const minutes = Math.round((avgWakeTimeHour - hours) * 60);
          averageWakeTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }

      const trendData: SleepTrendData = {
        period,
        startDate,
        endDate,
        averageDuration: Math.round(result.data.avg_duration || 0),
        averageQuality: Math.round(((result.data.avg_quality || 0) / 100) * 9 + 1), // Convert back to 1-10 scale
        averageBedtime,
        averageWakeTime,
        efficiency: Math.round(result.data.avg_efficiency || 0),
        consistency: 75, // Would calculate from variance in sleep times
        improvement: 5, // Would calculate from previous period comparison
        sessionCount: result.data.session_count || 0
      };

      return { success: true, data: trendData };

    } catch (error) {
      console.error('[SleepService] Failed to get sleep trends:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Map database row to SleepSession object
   */
  private async mapRowToSession(row: SleepSessionRow): Promise<SleepSession> {
    // Get related data
    const [stagesResult, factorsResult] = await Promise.all([
      this.getStages(row.id),
      database.executeQuery<QualityFactorRow>(`
        SELECT * FROM quality_factors WHERE session_id = ?
      `, [row.id])
    ]);

    const stages = stagesResult.success ? stagesResult.data || [] : [];
    const factors = factorsResult.success ? factorsResult.data || [] : [];

    const session: SleepSession = {
      id: row.id,
      userId: row.user_id,
      startTime: new Date(row.start_time * 1000),
      endTime: new Date(row.end_time * 1000),
      duration: row.duration,
      quality: {
        overall: Math.round((row.quality_overall / 100) * 9 + 1), // Convert back to 1-10 scale
        efficiency: row.quality_efficiency,
        restfulness: Math.round((row.quality_restfulness / 100) * 9 + 1), // Convert back to 1-10 scale
        factors: factors.map(factor => ({
          type: factor.type,
          impact: factor.impact,
          severity: factor.severity,
          description: factor.description
        }))
      },
      stages,
      heartRate: row.heart_rate_avg ? [{
        timestamp: new Date(row.start_time * 1000),
        bpm: row.heart_rate_avg,
        variability: row.heart_rate_variability
      }] : undefined,
      environment: {
        temperature: row.environment_temperature,
        humidity: row.environment_humidity,
        noiseLevel: row.environment_noise_level,
        lightLevel: row.environment_light_level
      },
      notes: row.notes,
      createdAt: new Date(row.created_at * 1000),
      updatedAt: new Date(row.updated_at * 1000)
    };

    return session;
  }

  /**
   * Get recent sleep sessions (last 30 days)
   */
  async getRecentSessions(
    userId: string = 'default_user',
    days: number = 30
  ): Promise<DatabaseResult<SleepSession[]>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getSessions({
      userId,
      startDate,
      endDate
    }, {
      orderBy: 'start_time',
      orderDirection: 'DESC'
    });
  }

  /**
   * Get sleep session count for date range
   */
  async getSessionCount(
    userId: string = 'default_user',
    startDate?: Date,
    endDate?: Date
  ): Promise<DatabaseResult<number>> {
    try {
      let whereClause = 'WHERE user_id = ?';
      const params: any[] = [userId];

      if (startDate) {
        whereClause += ' AND start_time >= ?';
        params.push(Math.floor(startDate.getTime() / 1000));
      }

      if (endDate) {
        whereClause += ' AND end_time <= ?';
        params.push(Math.floor(endDate.getTime() / 1000));
      }

      const result = await database.executeQueryFirst<{ count: number }>(`
        SELECT COUNT(*) as count FROM sleep_sessions ${whereClause}
      `, params);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: result.data?.count || 0
      };

    } catch (error) {
      console.error('[SleepService] Failed to get session count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const sleepService = SleepService.getInstance();