/**
 * Health Integration Utility Functions for Lunar Sleep Analysis App
 * Cross-platform utilities for health data processing and validation
 */

import { 
  RawSleepData, 
  ProcessedSleepSession, 
  ProcessedSleepStage, 
  LunarSleepStage, 
  HealthKitSleepStage,
  DataValidationResult,
  DataConflict,
  ProcessedHeartRateData,
  RawHeartRateData,
  DataQualityMetrics,
  HealthInsight,
} from './types';

import {
  HEALTHKIT_STAGE_MAPPING,
  DATA_SOURCE_PRIORITY,
  VALIDATION_THRESHOLDS,
  OPTIMAL_SLEEP_STAGES,
  SLEEP_QUALITY_WEIGHTS,
  SLEEP_SCORE_FACTORS,
  HEART_RATE_ZONES,
} from './constants';

/**
 * Converts HealthKit sleep stage to Lunar sleep stage
 */
export function mapHealthKitStage(healthKitStage: HealthKitSleepStage): LunarSleepStage {
  return HEALTHKIT_STAGE_MAPPING[healthKitStage] || 'light';
}

/**
 * Converts minutes to hours and minutes string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Calculates sleep efficiency percentage
 */
export function calculateSleepEfficiency(
  totalTimeInBed: number, 
  totalSleepTime: number
): number {
  if (totalTimeInBed <= 0) return 0;
  return Math.min(100, (totalSleepTime / totalTimeInBed) * 100);
}

/**
 * Validates raw sleep data for quality and completeness
 */
export function validateSleepData(data: RawSleepData[]): DataValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 1.0;

  for (const session of data) {
    // Validate session duration
    if (session.duration < VALIDATION_THRESHOLDS.minSessionDuration) {
      warnings.push(`Session ${session.id} duration (${session.duration}min) below minimum threshold`);
      confidence -= 0.1;
    }

    if (session.duration > VALIDATION_THRESHOLDS.maxSessionDuration) {
      errors.push(`Session ${session.id} duration (${session.duration}min) exceeds maximum threshold`);
    }

    // Validate timestamps
    if (session.startDate >= session.endDate) {
      errors.push(`Session ${session.id} has invalid time range`);
    }

    // Validate data source
    if (!session.source.name || !session.source.bundleIdentifier) {
      warnings.push(`Session ${session.id} missing complete source information`);
      confidence -= 0.05;
    }

    // Check for future dates
    if (session.endDate > new Date()) {
      errors.push(`Session ${session.id} has future end date`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    confidence: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * Validates heart rate data
 */
export function validateHeartRateData(data: RawHeartRateData[]): DataValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 1.0;

  for (const reading of data) {
    // Validate heart rate range
    if (reading.value < VALIDATION_THRESHOLDS.minHeartRate || 
        reading.value > VALIDATION_THRESHOLDS.maxHeartRate) {
      errors.push(`Heart rate reading ${reading.id} (${reading.value} BPM) out of valid range`);
    }

    // Check for reasonable values during sleep
    if (reading.value < HEART_RATE_ZONES.deep_sleep.min || 
        reading.value > HEART_RATE_ZONES.awake.max) {
      warnings.push(`Heart rate reading ${reading.id} (${reading.value} BPM) unusual for sleep period`);
      confidence -= 0.02;
    }

    // Validate timestamp
    if (reading.timestamp > new Date()) {
      errors.push(`Heart rate reading ${reading.id} has future timestamp`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    confidence: Math.max(0, Math.min(1, confidence))
  };
}

/**
 * Detects conflicts between sleep sessions
 */
export function detectSleepConflicts(
  existingSessions: ProcessedSleepSession[],
  newSessions: ProcessedSleepSession[]
): DataConflict[] {
  const conflicts: DataConflict[] = [];

  for (const newSession of newSessions) {
    for (const existingSession of existingSessions) {
      const conflict = checkSessionOverlap(existingSession, newSession);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}

/**
 * Checks for overlap between two sleep sessions
 */
function checkSessionOverlap(
  existing: ProcessedSleepSession,
  newSession: ProcessedSleepSession
): DataConflict | null {
  const overlapStart = new Date(Math.max(existing.startTime.getTime(), newSession.startTime.getTime()));
  const overlapEnd = new Date(Math.min(existing.endTime.getTime(), newSession.endTime.getTime()));
  const overlapMinutes = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));

  if (overlapMinutes > VALIDATION_THRESHOLDS.maxOverlapBetweenSessions) {
    const existingPriority = DATA_SOURCE_PRIORITY[existing.source.bundleIdentifier] || 0;
    const newPriority = DATA_SOURCE_PRIORITY[newSession.source.bundleIdentifier] || 0;
    
    return {
      id: `overlap_${existing.sessionId}_${newSession.sessionId}`,
      type: 'overlapping_sessions',
      existingData: existing,
      newData: newSession,
      recommendedAction: newPriority > existingPriority ? 'replace' : 'keep_existing',
      confidence: 0.8
    };
  }

  return null;
}

/**
 * Processes raw sleep data into structured sessions
 */
export function processSleepData(
  rawData: RawSleepData[],
  heartRateData?: RawHeartRateData[]
): ProcessedSleepSession[] {
  // Group raw data by session (same start/end time, same source)
  const sessionGroups = groupSleepDataBySession(rawData);
  
  return sessionGroups.map(group => {
    const stages = processStageData(group);
    const heartRate = processHeartRateForSession(
      heartRateData || [], 
      group[0].startDate, 
      group[0].endDate
    );
    
    const session: ProcessedSleepSession = {
      sessionId: generateSessionId(group[0]),
      startTime: group[0].startDate,
      endTime: group[0].endDate,
      duration: group[0].duration,
      stages,
      heartRateData: heartRate,
      source: group[0].source,
      quality: calculateSleepQuality(stages, heartRate, group[0].duration)
    };

    return session;
  });
}

/**
 * Groups raw sleep data by session
 */
function groupSleepDataBySession(rawData: RawSleepData[]): RawSleepData[][] {
  const sessions: Map<string, RawSleepData[]> = new Map();

  for (const data of rawData) {
    const sessionKey = `${data.startDate.getTime()}_${data.endDate.getTime()}_${data.source.bundleIdentifier}`;
    
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, []);
    }
    
    sessions.get(sessionKey)!.push(data);
  }

  return Array.from(sessions.values());
}

/**
 * Processes stage data from grouped raw data
 */
function processStageData(groupedData: RawSleepData[]): ProcessedSleepStage[] {
  const stages: ProcessedSleepStage[] = [];
  let sequenceOrder = 0;

  // Sort by start time
  const sortedData = groupedData.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  for (const data of sortedData) {
    if (data.stage) {
      const lunarStage = mapHealthKitStage(data.stage);
      stages.push({
        stage: lunarStage,
        startTime: data.startDate,
        endTime: data.endDate,
        duration: data.duration,
        sequenceOrder: sequenceOrder++
      });
    }
  }

  // Fill gaps with light sleep if any
  return fillStageGaps(stages);
}

/**
 * Fills gaps between sleep stages with light sleep
 */
function fillStageGaps(stages: ProcessedSleepStage[]): ProcessedSleepStage[] {
  if (stages.length === 0) return stages;

  const filledStages: ProcessedSleepStage[] = [];
  
  for (let i = 0; i < stages.length; i++) {
    const currentStage = stages[i];
    const nextStage = stages[i + 1];

    filledStages.push(currentStage);

    // Check for gap to next stage
    if (nextStage) {
      const gapMinutes = (nextStage.startTime.getTime() - currentStage.endTime.getTime()) / (1000 * 60);
      
      if (gapMinutes > VALIDATION_THRESHOLDS.maxGapBetweenStages) {
        // Fill gap with light sleep
        filledStages.push({
          stage: 'light',
          startTime: currentStage.endTime,
          endTime: nextStage.startTime,
          duration: gapMinutes,
          sequenceOrder: currentStage.sequenceOrder + 0.5
        });
      }
    }
  }

  // Re-sequence
  return filledStages.map((stage, index) => ({
    ...stage,
    sequenceOrder: index
  }));
}

/**
 * Processes heart rate data for a specific session
 */
function processHeartRateForSession(
  heartRateData: RawHeartRateData[],
  sessionStart: Date,
  sessionEnd: Date
): ProcessedHeartRateData[] {
  return heartRateData
    .filter(reading => 
      reading.timestamp >= sessionStart && 
      reading.timestamp <= sessionEnd
    )
    .map(reading => ({
      timestamp: reading.timestamp,
      bpm: reading.value,
      variability: calculateHRV(heartRateData, reading.timestamp)
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Calculates heart rate variability for a given timestamp
 */
function calculateHRV(
  heartRateData: RawHeartRateData[],
  timestamp: Date,
  windowMinutes: number = 5
): number | undefined {
  const windowStart = new Date(timestamp.getTime() - (windowMinutes * 60 * 1000));
  const windowEnd = new Date(timestamp.getTime() + (windowMinutes * 60 * 1000));
  
  const windowData = heartRateData.filter(reading =>
    reading.timestamp >= windowStart && reading.timestamp <= windowEnd
  );

  if (windowData.length < 3) return undefined;

  const intervals = windowData
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(1)
    .map((reading, index) => 
      (reading.timestamp.getTime() - windowData[index].timestamp.getTime()) / 1000
    );

  if (intervals.length < 2) return undefined;

  const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculates comprehensive sleep quality scores
 */
function calculateSleepQuality(
  stages: ProcessedSleepStage[],
  heartRate: ProcessedHeartRateData[],
  totalDuration: number
): { overall: number; efficiency: number; restfulness: number } {
  const durationScore = calculateDurationScore(totalDuration);
  const stageScore = calculateStageScore(stages);
  const heartRateScore = calculateHeartRateScore(heartRate);
  const awakeningsScore = calculateAwakeningsScore(stages);

  const efficiency = Math.min(100, stageScore * 0.6 + durationScore * 0.4);
  const restfulness = Math.min(100, awakeningsScore * 0.7 + heartRateScore * 0.3);
  const overall = Math.min(100, 
    durationScore * SLEEP_QUALITY_WEIGHTS.duration +
    efficiency * SLEEP_QUALITY_WEIGHTS.efficiency +
    stageScore * (SLEEP_QUALITY_WEIGHTS.deepSleepPercentage + SLEEP_QUALITY_WEIGHTS.remSleepPercentage) +
    heartRateScore * SLEEP_QUALITY_WEIGHTS.heartRateStability
  );

  return {
    overall: Math.round(overall),
    efficiency: Math.round(efficiency),
    restfulness: Math.round(restfulness)
  };
}

/**
 * Calculates duration score based on optimal sleep duration
 */
function calculateDurationScore(duration: number): number {
  const optimal = SLEEP_SCORE_FACTORS.optimalDuration;
  const min = SLEEP_SCORE_FACTORS.minAcceptableDuration;
  const max = SLEEP_SCORE_FACTORS.maxAcceptableDuration;

  if (duration >= min && duration <= max) {
    const deviation = Math.abs(duration - optimal);
    const maxDeviation = Math.max(optimal - min, max - optimal);
    return Math.max(70, 100 - (deviation / maxDeviation) * 30);
  }

  if (duration < min) {
    return Math.max(0, 70 * (duration / min));
  }

  // duration > max
  const excessRatio = (duration - max) / optimal;
  return Math.max(0, 70 - (excessRatio * 50));
}

/**
 * Calculates stage distribution score
 */
function calculateStageScore(stages: ProcessedSleepStage[]): number {
  if (stages.length === 0) return 0;

  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
  const stagePercentages = {
    deep: 0,
    rem: 0,
    light: 0,
    awake: 0
  };

  stages.forEach(stage => {
    stagePercentages[stage.stage] += (stage.duration / totalDuration) * 100;
  });

  let score = 100;
  
  // Evaluate each stage against optimal ranges
  Object.entries(stagePercentages).forEach(([stage, percentage]) => {
    const optimal = OPTIMAL_SLEEP_STAGES[stage as keyof typeof OPTIMAL_SLEEP_STAGES];
    if (percentage < optimal.min || percentage > optimal.max) {
      const deviation = percentage < optimal.min 
        ? optimal.min - percentage 
        : percentage - optimal.max;
      score -= deviation * 2; // 2 points per percentage point deviation
    }
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates heart rate stability score
 */
function calculateHeartRateScore(heartRate: ProcessedHeartRateData[]): number {
  if (heartRate.length < 10) return 75; // Default score if insufficient data

  const bpmValues = heartRate.map(reading => reading.bpm);
  const mean = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length;
  const variance = bpmValues.reduce((sum, bpm) => sum + Math.pow(bpm - mean, 2), 0) / bpmValues.length;
  const standardDeviation = Math.sqrt(variance);

  // Lower standard deviation = better sleep
  const maxAcceptableSD = 15; // BPM
  const score = Math.max(0, 100 - (standardDeviation / maxAcceptableSD) * 100);

  return Math.min(100, score);
}

/**
 * Calculates awakenings score based on frequency and duration
 */
function calculateAwakeningsScore(stages: ProcessedSleepStage[]): number {
  const awakeStages = stages.filter(stage => stage.stage === 'awake');
  const totalAwakeTime = awakeStages.reduce((sum, stage) => sum + stage.duration, 0);
  
  let score = 100;
  
  // Penalize for number of awakenings
  if (awakeStages.length > SLEEP_SCORE_FACTORS.maxOptimalAwakenings) {
    score -= (awakeStages.length - SLEEP_SCORE_FACTORS.maxOptimalAwakenings) * 5;
  }
  
  // Penalize for total awake time
  if (totalAwakeTime > SLEEP_SCORE_FACTORS.optimalAwakeTime) {
    const excessTime = totalAwakeTime - SLEEP_SCORE_FACTORS.optimalAwakeTime;
    score -= excessTime * 2; // 2 points per minute of excess awake time
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generates a unique session ID
 */
function generateSessionId(data: RawSleepData): string {
  const timestamp = data.startDate.getTime();
  const source = data.source.bundleIdentifier.replace(/[^a-zA-Z0-9]/g, '');
  return `sleep_${timestamp}_${source}`;
}

/**
 * Calculates data quality metrics
 */
export function calculateDataQualityMetrics(
  sessions: ProcessedSleepSession[],
  timeRange: { start: Date; end: Date }
): DataQualityMetrics {
  if (sessions.length === 0) {
    return {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      timeliness: 0,
      sourceReliability: 0,
      dataFreshness: 0,
      gapAnalysis: {
        totalGaps: 0,
        longestGap: 0,
        averageGap: 0
      }
    };
  }

  const completeness = calculateCompleteness(sessions, timeRange);
  const accuracy = calculateAccuracy(sessions);
  const consistency = calculateConsistency(sessions);
  const timeliness = calculateTimeliness(sessions);
  const sourceReliability = calculateSourceReliability(sessions);
  const dataFreshness = calculateDataFreshness(sessions);
  const gapAnalysis = calculateGapAnalysis(sessions, timeRange);

  return {
    completeness,
    accuracy,
    consistency,
    timeliness,
    sourceReliability,
    dataFreshness,
    gapAnalysis
  };
}

/**
 * Calculates completeness metric
 */
function calculateCompleteness(
  sessions: ProcessedSleepSession[],
  timeRange: { start: Date; end: Date }
): number {
  const totalDays = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const daysWithData = new Set(sessions.map(session => 
    new Date(session.startTime).toDateString()
  )).size;
  
  return Math.min(100, (daysWithData / totalDays) * 100);
}

/**
 * Calculates accuracy metric based on validation results
 */
function calculateAccuracy(sessions: ProcessedSleepSession[]): number {
  let totalConfidence = 0;
  let sessionCount = 0;

  sessions.forEach(session => {
    // Validate session duration
    let confidence = 1.0;
    
    if (session.duration < VALIDATION_THRESHOLDS.minSessionDuration ||
        session.duration > VALIDATION_THRESHOLDS.maxSessionDuration) {
      confidence -= 0.3;
    }

    // Check stage distribution
    const stageScore = calculateStageScore(session.stages);
    confidence *= (stageScore / 100);

    totalConfidence += confidence;
    sessionCount++;
  });

  return sessionCount > 0 ? Math.min(100, (totalConfidence / sessionCount) * 100) : 0;
}

/**
 * Calculates consistency metric
 */
function calculateConsistency(sessions: ProcessedSleepSession[]): number {
  if (sessions.length < 2) return 100;

  const bedtimes = sessions.map(session => {
    const bedtime = new Date(session.startTime);
    return bedtime.getHours() * 60 + bedtime.getMinutes();
  });

  const mean = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
  const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / bedtimes.length;
  const standardDeviation = Math.sqrt(variance);

  // Lower deviation = higher consistency
  const maxAcceptableDeviation = 60; // 1 hour
  const consistency = Math.max(0, 100 - (standardDeviation / maxAcceptableDeviation) * 100);

  return Math.min(100, consistency);
}

/**
 * Calculates timeliness metric
 */
function calculateTimeliness(sessions: ProcessedSleepSession[]): number {
  const now = new Date();
  const recentSessions = sessions.filter(session => 
    (now.getTime() - session.endTime.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
  );

  if (recentSessions.length === 0) return 50; // Neutral score if no recent data

  return Math.min(100, (recentSessions.length / 7) * 100); // Expect daily data
}

/**
 * Calculates source reliability metric
 */
function calculateSourceReliability(sessions: ProcessedSleepSession[]): number {
  const sourceReliabilities: number[] = [];

  sessions.forEach(session => {
    const priority = DATA_SOURCE_PRIORITY[session.source.bundleIdentifier] || 50;
    sourceReliabilities.push(priority);
  });

  const averageReliability = sourceReliabilities.reduce((sum, r) => sum + r, 0) / sourceReliabilities.length;
  return Math.min(100, averageReliability);
}

/**
 * Calculates data freshness metric
 */
function calculateDataFreshness(sessions: ProcessedSleepSession[]): number {
  if (sessions.length === 0) return 0;

  const mostRecentSession = sessions.reduce((latest, session) => 
    session.endTime > latest.endTime ? session : latest
  );

  const hoursSinceLastUpdate = (Date.now() - mostRecentSession.endTime.getTime()) / (1000 * 60 * 60);
  
  // Fresh data within 24 hours gets full score
  if (hoursSinceLastUpdate <= 24) return hoursSinceLastUpdate;
  
  // Linear degradation over 7 days
  return Math.max(0, 24 - Math.min(7 * 24, hoursSinceLastUpdate - 24) / 7);
}

/**
 * Calculates gap analysis
 */
function calculateGapAnalysis(
  sessions: ProcessedSleepSession[],
  timeRange: { start: Date; end: Date }
): { totalGaps: number; longestGap: number; averageGap: number } {
  if (sessions.length === 0) {
    const totalHours = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60);
    return {
      totalGaps: 1,
      longestGap: totalHours,
      averageGap: totalHours
    };
  }

  const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const gaps: number[] = [];

  for (let i = 0; i < sortedSessions.length - 1; i++) {
    const currentEnd = sortedSessions[i].endTime;
    const nextStart = sortedSessions[i + 1].startTime;
    const gapHours = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
    
    if (gapHours > 12) { // Consider gaps longer than 12 hours as missing data
      gaps.push(gapHours);
    }
  }

  if (gaps.length === 0) {
    return {
      totalGaps: 0,
      longestGap: 0,
      averageGap: 0
    };
  }

  return {
    totalGaps: gaps.length,
    longestGap: Math.max(...gaps),
    averageGap: gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
  };
}

/**
 * Generates health insights from processed data
 */
export function generateHealthInsights(
  sessions: ProcessedSleepSession[],
  timeWindow: number = 14 // days
): HealthInsight[] {
  const insights: HealthInsight[] = [];
  const now = new Date();
  const windowStart = new Date(now.getTime() - (timeWindow * 24 * 60 * 60 * 1000));
  
  const recentSessions = sessions.filter(session => session.startTime >= windowStart);
  
  if (recentSessions.length < 3) return insights;

  // Check for sleep duration patterns
  const durationInsight = analyzeDurationPattern(recentSessions);
  if (durationInsight) insights.push(durationInsight);

  // Check for sleep quality trends
  const qualityInsight = analyzeQualityTrend(recentSessions);
  if (qualityInsight) insights.push(qualityInsight);

  // Check for bedtime consistency
  const consistencyInsight = analyzeBedtimeConsistency(recentSessions);
  if (consistencyInsight) insights.push(consistencyInsight);

  return insights;
}

/**
 * Analyzes sleep duration patterns
 */
function analyzeDurationPattern(sessions: ProcessedSleepSession[]): HealthInsight | null {
  const averageDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length;
  const optimalDuration = SLEEP_SCORE_FACTORS.optimalDuration;
  
  if (Math.abs(averageDuration - optimalDuration) > 60) { // More than 1 hour deviation
    const isShort = averageDuration < optimalDuration;
    
    return {
      id: `duration_pattern_${Date.now()}`,
      type: 'pattern',
      title: isShort ? 'Short Sleep Pattern Detected' : 'Long Sleep Pattern Detected',
      description: `Your average sleep duration is ${formatDuration(averageDuration)}, which is ${isShort ? 'shorter' : 'longer'} than the recommended 8 hours.`,
      confidence: 0.8,
      priority: 'medium',
      actionable: true,
      suggestedAction: isShort ? 'Try going to bed 30 minutes earlier' : 'Consider adjusting your bedtime for optimal sleep quality',
      dataSource: sessions.map(s => s.source),
      relatedSessions: sessions.map(s => s.sessionId),
      createdAt: new Date(),
    };
  }

  return null;
}

/**
 * Analyzes sleep quality trends
 */
function analyzeQualityTrend(sessions: ProcessedSleepSession[]): HealthInsight | null {
  if (sessions.length < 7) return null;

  const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
  const secondHalf = sessions.slice(Math.floor(sessions.length / 2));
  
  const firstHalfQuality = firstHalf.reduce((sum, s) => sum + s.quality.overall, 0) / firstHalf.length;
  const secondHalfQuality = secondHalf.reduce((sum, s) => sum + s.quality.overall, 0) / secondHalf.length;
  
  const improvement = secondHalfQuality - firstHalfQuality;
  
  if (Math.abs(improvement) > 10) { // Significant change
    const isImproving = improvement > 0;
    
    return {
      id: `quality_trend_${Date.now()}`,
      type: isImproving ? 'achievement' : 'pattern',
      title: isImproving ? 'Sleep Quality Improving' : 'Sleep Quality Declining',
      description: `Your sleep quality has ${isImproving ? 'improved' : 'declined'} by ${Math.abs(improvement).toFixed(1)} points over the recent period.`,
      confidence: 0.75,
      priority: isImproving ? 'low' : 'high',
      actionable: !isImproving,
      suggestedAction: isImproving ? undefined : 'Review your sleep environment and bedtime routine',
      dataSource: sessions.map(s => s.source),
      relatedSessions: sessions.map(s => s.sessionId),
      createdAt: new Date(),
    };
  }

  return null;
}

/**
 * Analyzes bedtime consistency
 */
function analyzeBedtimeConsistency(sessions: ProcessedSleepSession[]): HealthInsight | null {
  const consistencyScore = calculateConsistency(sessions);
  
  if (consistencyScore < 70) {
    return {
      id: `consistency_${Date.now()}`,
      type: 'recommendation',
      title: 'Inconsistent Sleep Schedule',
      description: `Your bedtime varies significantly. Consistency score: ${consistencyScore.toFixed(0)}/100.`,
      confidence: 0.85,
      priority: 'medium',
      actionable: true,
      suggestedAction: 'Try to maintain a regular bedtime and wake time, even on weekends',
      dataSource: sessions.map(s => s.source),
      relatedSessions: sessions.map(s => s.sessionId),
      createdAt: new Date(),
    };
  }

  return null;
}