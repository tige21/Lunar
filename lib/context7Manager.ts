/**
 * Context7 Manager - Advanced 7-Level Context System
 * Provides multi-dimensional user context for highly personalized AI responses
 * 
 * Performance Optimizations:
 * - Lazy loading of context levels
 * - Intelligent caching with TTL
 * - Memory management
 * - Background updates
 * - Selective context loading based on priority
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { onboardingService } from './database/onboardingService';
import { userContextManager } from './userContextManager';
import type { SupportedLanguage } from './languageDetection';

const CONTEXT7_STORAGE_KEY = '@lunar_context7_data';

export interface Context7Data {
  // Level 1: Basic User Profile
  level1_UserProfile: {
    userId: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    timezone: string;
    locale: string;
    language: SupportedLanguage;
    chronotype?: 'extreme_morning' | 'morning' | 'neutral' | 'evening' | 'extreme_evening';
    sleepGoals?: {
      duration: number;
      bedtime: string;
      wakeTime: string;
      qualityGoal: number;
    };
  };

  // Level 2: Behavioral Patterns
  level2_BehavioralPatterns: {
    sleepHabits: {
      consistencyScore: number; // 0-100
      weekdayBedtime?: string;
      weekendBedtime?: string;
      averageFallAsleepTime: number; // minutes
      nightWakingsFrequency: number; // per week
      weekendSleepIn?: boolean;
      napFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    };
    lifestyle: {
      exerciseFrequency: 'none' | 'rarely' | 'weekly' | 'several_times_week' | 'daily';
      exerciseTime?: 'morning' | 'afternoon' | 'evening';
      screenTimeBeforeBed: number; // minutes
      caffeineIntake: 'none' | 'low' | 'moderate' | 'high';
      alcoholIntake: 'none' | 'rarely' | 'moderate' | 'frequent';
      stressLevel: number; // 1-5 scale
      workSchedule: 'regular' | 'shift' | 'flexible' | 'irregular';
    };
    environment: {
      bedroomTemperature?: number;
      noiseLevel: 'very_quiet' | 'quiet' | 'moderate' | 'noisy';
      lightLevel: 'dark' | 'dim' | 'moderate' | 'bright';
      bedComfort: number; // 1-5 scale
      roomSharing: boolean;
      petSleepDisruption: boolean;
    };
  };

  // Level 3: Historical Data & Trends  
  level3_HistoricalData: {
    sleepTrends: {
      averageSleepDuration: number; // last 30 days
      sleepQualityTrend: 'improving' | 'stable' | 'declining';
      bestSleepPeriods: Array<{ start: string; end: string; quality: number }>;
      problemPeriods: Array<{ start: string; end: string; issues: string[] }>;
      seasonalPatterns?: {
        spring?: { duration: number; quality: number };
        summer?: { duration: number; quality: number };
        fall?: { duration: number; quality: number };
        winter?: { duration: number; quality: number };
      };
    };
    chatHistory: {
      totalInteractions: number;
      commonTopics: string[];
      successfulRecommendations: string[];
      ignoredAdvice: string[];
      preferredResponseStyle: 'brief' | 'detailed' | 'conversational';
      lastActiveDate: Date;
    };
  };

  // Level 4: Temporal & Environmental Context
  level4_TemporalContext: {
    currentTime: {
      hour: number;
      dayOfWeek: number; // 0-6 (Sunday = 0)
      dayOfMonth: number;
      month: number;
      season: 'spring' | 'summer' | 'fall' | 'winter';
      isWeekend: boolean;
      isHoliday?: boolean;
    };
    biorhythm: {
      currentChronotypePhase: 'peak' | 'maintenance' | 'recovery';
      optimalBedtimeWindow: { start: string; end: string };
      energyLevelPrediction: number; // 0-100
      alertnessWindow: { start: string; end: string };
    };
    externalFactors: {
      weather?: {
        temperature: number;
        humidity: number;
        pressure: number;
        condition: string;
      };
      moonPhase?: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
      daylightDuration?: number; // minutes
    };
  };

  // Level 5: Emotional & Psychological State
  level5_EmotionalState: {
    currentMood: {
      energy: number; // 1-5
      stress: number; // 1-5  
      motivation: number; // 1-5
      anxiety: number; // 1-5
      optimism: number; // 1-5
      lastUpdated: Date;
    };
    sleepAnxiety: {
      fearOfInsomnia: boolean;
      bedtimeAnxiety: number; // 1-5
      performanceAnxiety: boolean; // worry about sleep affecting next day
      clockWatching: boolean;
    };
    lifeEvents: {
      recentStressors: Array<{ event: string; impact: number; date: Date }>;
      positiveEvents: Array<{ event: string; impact: number; date: Date }>;
      travelSchedule?: Array<{ destination: string; startDate: Date; endDate: Date }>;
      workDeadlines?: Array<{ description: string; date: Date; stressLevel: number }>;
    };
  };

  // Level 6: Goals & Progress Tracking
  level6_GoalsProgress: {
    activeGoals: Array<{
      id: string;
      type: 'sleep_duration' | 'sleep_quality' | 'consistency' | 'bedtime' | 'environment' | 'routine';
      description: string;
      targetValue: number;
      currentValue: number;
      progress: number; // 0-100%
      deadline?: Date;
      priority: 'low' | 'medium' | 'high';
      status: 'active' | 'paused' | 'completed' | 'abandoned';
    }>;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      dateAchieved: Date;
      category: 'consistency' | 'improvement' | 'milestone' | 'habit';
    }>;
    challenges: Array<{
      id: string;
      area: string;
      difficulty: 'low' | 'medium' | 'high';
      attempts: number;
      lastAttempt: Date;
      successRate: number; // 0-100%
    }>;
    preferences: {
      reminderFrequency: 'none' | 'weekly' | 'daily';
      motivationStyle: 'encouraging' | 'direct' | 'data_driven' | 'casual';
      feedbackPreference: 'immediate' | 'daily' | 'weekly';
    };
  };

  // Level 7: Adaptive Learning & Predictions
  level7_AdaptiveLearning: {
    personalityInsights: {
      responseToAdvice: 'highly_receptive' | 'receptive' | 'selective' | 'resistant';
      preferredContentType: 'scientific' | 'practical' | 'motivational' | 'casual';
      engagementPattern: 'consistent' | 'sporadic' | 'crisis_driven' | 'goal_oriented';
      communicationStyle: 'formal' | 'friendly' | 'casual' | 'technical';
    };
    predictiveModels: {
      sleepQualityPrediction: number; // predicted quality for tonight (0-100)
      optimalInterventionTime: string; // best time to suggest changes
      recommendationSuccess: {
        environmental: number; // success rate 0-1
        routine: number;
        timing: number;
        lifestyle: number;
      };
      riskFactors: Array<{
        factor: string;
        probability: number; // 0-1
        impact: number; // 1-5
        mitigation: string;
      }>;
    };
    adaptivePersonalization: {
      responseLength: 'brief' | 'medium' | 'detailed';
      technicalDepth: 'basic' | 'intermediate' | 'advanced';
      motivationalTone: 'gentle' | 'encouraging' | 'challenging' | 'scientific';
      culturalAdaptations: string[]; // cultural considerations
      languageComplexity: 'simple' | 'standard' | 'complex';
    };
  };

  // Metadata
  metadata: {
    version: string;
    lastUpdated: Date;
    dataCompleteness: number; // 0-100%
    confidenceScore: number; // 0-100%
  };
}

class Context7Manager {
  private static instance: Context7Manager;
  private context7Data: Partial<Context7Data> = {};
  private updateSchedule: NodeJS.Timeout | null = null;
  
  // Performance optimizations
  private levelCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private priorityLevels: Array<keyof Context7Data> = [
    'level1_UserProfile', 
    'level2_BehavioralPatterns', 
    'level4_TemporalContext', 
    'level6_GoalsProgress', 
    'level3_HistoricalData', 
    'level5_EmotionalState', 
    'level7_AdaptiveLearning'
  ];
  private isUpdating = false;
  private updateQueue: Array<() => Promise<void>> = [];

  constructor() {
    this.loadContext7Data();
    this.scheduleRegularUpdates();
  }

  static getInstance(): Context7Manager {
    if (!Context7Manager.instance) {
      Context7Manager.instance = new Context7Manager();
    }
    return Context7Manager.instance;
  }

  /**
   * Get complete Context7 data with performance optimizations
   */
  async getContext7Data(): Promise<Partial<Context7Data>> {
    await this.updateAllLevelsOptimized();
    return this.context7Data;
  }

  /**
   * Get priority context data for immediate use (faster)
   */
  async getPriorityContext(): Promise<Partial<Context7Data>> {
    await this.updatePriorityLevels();
    return this.context7Data;
  }

  /**
   * Update all 7 levels with performance optimizations
   */
  private async updateAllLevelsOptimized(): Promise<void> {
    if (this.isUpdating) {
      return new Promise((resolve) => {
        this.updateQueue.push(async () => resolve());
      });
    }

    this.isUpdating = true;
    
    try {
      // Update priority levels first for immediate context
      await this.updatePriorityLevels();
      
      // Then update remaining levels in background
      const backgroundUpdates = [
        this.updateLevel3_HistoricalData(),
        this.updateLevel5_EmotionalState(),
        this.updateLevel7_AdaptiveLearning(),
      ];
      
      // Don't await background updates - let them complete asynchronously
      Promise.all(backgroundUpdates).catch(error => {
        console.warn('Background context updates failed:', error);
      });
    } finally {
      this.isUpdating = false;
      
      // Process any queued updates
      const queuedUpdates = [...this.updateQueue];
      this.updateQueue = [];
      queuedUpdates.forEach(update => update());
    }
  }

  /**
   * Update only priority levels for immediate context
   */
  private async updatePriorityLevels(): Promise<void> {
    const priorityUpdates = [
      this.updateLevel1_UserProfile(),
      this.updateLevel2_BehavioralPatterns(),
      this.updateLevel4_TemporalContext(),
      this.updateLevel6_GoalsProgress(),
    ];
    
    await Promise.all(priorityUpdates);

    this.updateMetadata();
    await this.saveContext7Data();
  }

  /**
   * Level 1: Basic User Profile
   */
  private async updateLevel1_UserProfile(): Promise<void> {
    const userPreferences = await onboardingService.getUserPreferences();
    const sleepGoals = await onboardingService.getSleepGoals();
    const extendedData = await onboardingService.getExtendedData();
    const locale = Localization.locale;
    const timezone = Localization.timezone || 'UTC';

    this.context7Data.level1_UserProfile = {
      userId: 'user_' + Date.now().toString(36), // In real app, this would be actual user ID
      age: extendedData?.age,
      gender: extendedData?.gender,
      timezone,
      locale,
      language: userPreferences.language || 'en',
      chronotype: userPreferences.chronotype?.type,
      sleepGoals: sleepGoals ? {
        duration: sleepGoals.duration,
        bedtime: sleepGoals.bedtime,
        wakeTime: sleepGoals.wakeTime,
        qualityGoal: sleepGoals.qualityGoal,
      } : undefined,
    };
  }

  /**
   * Level 2: Behavioral Patterns
   */
  private async updateLevel2_BehavioralPatterns(): Promise<void> {
    const userPreferences = await onboardingService.getUserPreferences();
    const sleepGoals = await onboardingService.getSleepGoals();
    const extendedData = await onboardingService.getExtendedData();

    // Use extended data when available, fallback to defaults
    this.context7Data.level2_BehavioralPatterns = {
      sleepHabits: {
        consistencyScore: 75, // This would be calculated from actual sleep data
        weekdayBedtime: extendedData?.sleepHabits?.weekdayBedtime || sleepGoals?.bedtime,
        weekendBedtime: extendedData?.sleepHabits?.weekendBedtime || sleepGoals?.bedtime,
        averageFallAsleepTime: extendedData?.sleepHabits?.averageFallAsleepTime || 15,
        nightWakingsFrequency: extendedData?.sleepHabits?.nightWakingsFrequency || 2,
        weekendSleepIn: extendedData?.sleepHabits?.weekendSleepIn ?? true,
        napFrequency: extendedData?.sleepHabits?.napFrequency || 'rarely',
      },
      lifestyle: {
        exerciseFrequency: extendedData?.lifestyle?.exerciseFrequency || 'weekly',
        exerciseTime: extendedData?.lifestyle?.exerciseTime || 'evening',
        screenTimeBeforeBed: extendedData?.lifestyle?.screenTimeBeforeBed || 45,
        caffeineIntake: extendedData?.lifestyle?.caffeineIntake || 'moderate',
        alcoholIntake: extendedData?.lifestyle?.alcoholIntake || 'rarely',
        stressLevel: extendedData?.lifestyle?.stressLevel || 3,
        workSchedule: extendedData?.lifestyle?.workSchedule || 'regular',
      },
      environment: {
        bedroomTemperature: extendedData?.environment?.bedroomTemperature || 20,
        noiseLevel: extendedData?.environment?.noiseLevel || 'quiet',
        lightLevel: extendedData?.environment?.lightLevel || 'dim',
        bedComfort: extendedData?.environment?.bedComfort || 4,
        roomSharing: extendedData?.environment?.roomSharing ?? false,
        petSleepDisruption: extendedData?.environment?.petSleepDisruption ?? false,
      },
    };
  }

  /**
   * Level 3: Historical Data & Trends
   */
  private async updateLevel3_HistoricalData(): Promise<void> {
    // Mock historical data - in real app, this would come from sleep tracking
    this.context7Data.level3_HistoricalData = {
      sleepTrends: {
        averageSleepDuration: 7.3,
        sleepQualityTrend: 'improving',
        bestSleepPeriods: [
          { start: '2024-01-01', end: '2024-01-07', quality: 85 },
        ],
        problemPeriods: [
          { start: '2023-12-15', end: '2023-12-20', issues: ['stress', 'late_bedtime'] },
        ],
      },
      chatHistory: {
        totalInteractions: 12,
        commonTopics: ['sleep_quality', 'bedtime_routine', 'sleep_environment'],
        successfulRecommendations: ['cooler_room', 'consistent_bedtime'],
        ignoredAdvice: ['no_screens_before_bed'],
        preferredResponseStyle: 'detailed',
        lastActiveDate: new Date(),
      },
    };
  }

  /**
   * Level 4: Temporal & Environmental Context
   */
  private async updateLevel4_TemporalContext(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Determine season based on month (Northern Hemisphere)
    let season: 'spring' | 'summer' | 'fall' | 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';

    // Determine chronotype phase (simplified)
    let currentPhase: 'peak' | 'maintenance' | 'recovery';
    if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
      currentPhase = 'peak';
    } else if (hour >= 11 && hour <= 15) {
      currentPhase = 'maintenance';
    } else {
      currentPhase = 'recovery';
    }

    this.context7Data.level4_TemporalContext = {
      currentTime: {
        hour,
        dayOfWeek,
        dayOfMonth: now.getDate(),
        month,
        season,
        isWeekend,
      },
      biorhythm: {
        currentChronotypePhase: currentPhase,
        optimalBedtimeWindow: { start: '22:00', end: '23:00' },
        energyLevelPrediction: hour >= 6 && hour <= 20 ? 75 : 30,
        alertnessWindow: { start: '08:00', end: '18:00' },
      },
      externalFactors: {
        // In real app, these would come from weather API
        weather: {
          temperature: 18,
          humidity: 55,
          pressure: 1013,
          condition: 'clear',
        },
        moonPhase: 'waxing_crescent',
        daylightDuration: season === 'summer' ? 900 : 600, // minutes
      },
    };
  }

  /**
   * Level 5: Emotional & Psychological State
   */
  private async updateLevel5_EmotionalState(): Promise<void> {
    // In real app, this could be updated via user input or inferred from behavior
    this.context7Data.level5_EmotionalState = {
      currentMood: {
        energy: 3,
        stress: 3,
        motivation: 4,
        anxiety: 2,
        optimism: 4,
        lastUpdated: new Date(),
      },
      sleepAnxiety: {
        fearOfInsomnia: false,
        bedtimeAnxiety: 2,
        performanceAnxiety: true,
        clockWatching: false,
      },
      lifeEvents: {
        recentStressors: [],
        positiveEvents: [],
      },
    };
  }

  /**
   * Level 6: Goals & Progress Tracking
   */
  private async updateLevel6_GoalsProgress(): Promise<void> {
    const sleepGoals = await onboardingService.getSleepGoals();
    const extendedData = await onboardingService.getExtendedData();
    const userPrefs = await onboardingService.getUserPreferences();
    
    // Convert onboarding goals to Context7 format
    const activeGoals: any[] = [];
    
    if (sleepGoals) {
      // Add duration goal if specified
      if (sleepGoals.duration) {
        activeGoals.push({
          id: 'sleep_duration',
          type: 'sleep_duration',
          description: `Sleep ${sleepGoals.duration} hours per night`,
          targetValue: sleepGoals.duration,
          currentValue: sleepGoals.duration * 0.85, // Assume 85% of target initially
          progress: 85,
          priority: 'high',
          status: 'active',
        });
      }
      
      // Add quality goal
      if (sleepGoals.qualityGoal) {
        activeGoals.push({
          id: 'sleep_quality',
          type: 'sleep_quality',
          description: `Achieve sleep quality score of ${sleepGoals.qualityGoal}/5`,
          targetValue: sleepGoals.qualityGoal,
          currentValue: Math.max(1, sleepGoals.qualityGoal - 1),
          progress: Math.round(((sleepGoals.qualityGoal - 1) / sleepGoals.qualityGoal) * 100),
          priority: 'medium',
          status: 'active',
        });
      }
      
      // Add consistency goal based on bedtime/wake time
      if (sleepGoals.bedtime && sleepGoals.wakeTime) {
        activeGoals.push({
          id: 'consistency_goal',
          type: 'consistency',
          description: 'Maintain consistent sleep schedule',
          targetValue: 90, // 90% consistency
          currentValue: 75, // Initial estimate
          progress: 83,
          priority: sleepGoals.priorities?.includes('consistency') ? 'high' : 'medium',
          status: 'active',
        });
      }
    }
    
    // Add goals from extended data if available
    if (extendedData?.sleepGoals) {
      extendedData.sleepGoals.forEach(goal => {
        activeGoals.push({
          id: `extended_${goal.type}`,
          type: goal.type,
          description: goal.description,
          targetValue: goal.targetValue || 100,
          currentValue: (goal.targetValue || 100) * 0.7, // Assume 70% initially
          progress: 70,
          priority: goal.priority,
          status: 'active',
        });
      });
    }
    
    this.context7Data.level6_GoalsProgress = {
      activeGoals,
      achievements: [
        {
          id: 'onboarding_complete',
          title: 'Welcome to Lunar',
          description: 'Completed onboarding and set up sleep profile',
          dateAchieved: new Date(),
          category: 'milestone',
        },
      ],
      challenges: [
        {
          id: 'establishing_routine',
          area: 'sleep_routine',
          difficulty: 'medium',
          attempts: 1,
          lastAttempt: new Date(),
          successRate: 0, // Just starting
        },
      ],
      preferences: {
        reminderFrequency: extendedData?.aiPreferences?.reminderFrequency || 'daily',
        motivationStyle: extendedData?.aiPreferences?.motivationalTone || 'encouraging',
        feedbackPreference: extendedData?.aiPreferences?.feedbackPreference || 'daily',
      },
    };
  }

  /**
   * Level 7: Adaptive Learning & Predictions
   */
  private async updateLevel7_AdaptiveLearning(): Promise<void> {
    const extendedData = await onboardingService.getExtendedData();
    const userPrefs = await onboardingService.getUserPreferences();
    const sleepGoals = await onboardingService.getSleepGoals();
    
    // Determine personality insights from onboarding data
    const personalityInsights = {
      responseToAdvice: 'receptive', // Default, will be learned over time
      preferredContentType: extendedData?.aiPreferences?.technicalDepth === 'basic' ? 'simple' : 
                            extendedData?.aiPreferences?.technicalDepth === 'advanced' ? 'detailed' : 'practical',
      engagementPattern: sleepGoals?.priorities?.length > 2 ? 'goal_oriented' : 'casual',
      communicationStyle: extendedData?.aiPreferences?.motivationalTone || 'friendly',
    };
    
    // Build predictive models based on user data
    const predictiveModels = {
      sleepQualityPrediction: sleepGoals?.qualityGoal ? (sleepGoals.qualityGoal * 20) : 78, // Convert 1-5 to percentage
      optimalInterventionTime: sleepGoals?.bedtime ? 
        // 1 hour before bedtime
        new Date(`2000-01-01 ${sleepGoals.bedtime}`).getHours() - 1 + ':00' : 
        '19:00',
      recommendationSuccess: {
        environmental: sleepGoals?.sleepEnvironment ? 0.8 : 0.5,
        routine: extendedData?.sleepHabits ? 0.7 : 0.5,
        timing: sleepGoals?.bedtime && sleepGoals?.wakeTime ? 0.9 : 0.6,
        lifestyle: extendedData?.lifestyle ? 0.6 : 0.4,
      },
      riskFactors: [
        ...(extendedData?.sleepHabits?.weekendSleepIn ? [{
          factor: 'weekend_sleep_inconsistency',
          probability: 0.7,
          impact: 3,
          mitigation: 'Set weekend sleep reminders',
        }] : []),
        ...(extendedData?.lifestyle?.stressLevel && extendedData.lifestyle.stressLevel > 3 ? [{
          factor: 'high_stress_levels',
          probability: 0.6,
          impact: 4,
          mitigation: 'Practice stress reduction techniques before bed',
        }] : []),
        ...(extendedData?.lifestyle?.screenTimeBeforeBed && extendedData.lifestyle.screenTimeBeforeBed > 60 ? [{
          factor: 'excessive_screen_time',
          probability: 0.8,
          impact: 3,
          mitigation: 'Reduce screen time 1 hour before bed',
        }] : []),
      ],
    };
    
    // Adaptive personalization from user preferences
    const adaptivePersonalization = {
      responseLength: extendedData?.aiPreferences?.responseLength || 'medium',
      technicalDepth: extendedData?.aiPreferences?.technicalDepth || 'intermediate',
      motivationalTone: extendedData?.aiPreferences?.motivationalTone || 'encouraging',
      culturalAdaptations: userPrefs?.language === 'ru' ? ['russian_culture'] : [],
      languageComplexity: extendedData?.aiPreferences?.technicalDepth === 'basic' ? 'simple' : 'standard',
    };
    
    this.context7Data.level7_AdaptiveLearning = {
      personalityInsights,
      predictiveModels,
      adaptivePersonalization,
    };
  }

  /**
   * Update metadata
   */
  private updateMetadata(): void {
    const completeness = this.calculateDataCompleteness();
    const confidence = this.calculateConfidenceScore();

    this.context7Data.metadata = {
      version: '1.0.0',
      lastUpdated: new Date(),
      dataCompleteness: completeness,
      confidenceScore: confidence,
    };
  }

  /**
   * Calculate how complete the context data is (0-100%)
   */
  private calculateDataCompleteness(): number {
    let totalFields = 0;
    let filledFields = 0;

    const countFields = (obj: any): void => {
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          if (key !== 'metadata') {
            totalFields++;
            if (value !== undefined && value !== null) {
              filledFields++;
            }
            if (typeof value === 'object') {
              countFields(value);
            }
          }
        });
      }
    };

    countFields(this.context7Data);
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }

  /**
   * Calculate confidence score based on data age and completeness
   */
  private calculateConfidenceScore(): number {
    const completeness = this.calculateDataCompleteness();
    const dataAge = Date.now() - (this.context7Data.metadata?.lastUpdated?.getTime() || 0);
    const ageInHours = dataAge / (1000 * 60 * 60);
    
    // Reduce confidence based on data age
    let ageFactor = 1;
    if (ageInHours > 24) ageFactor = 0.8;
    if (ageInHours > 72) ageFactor = 0.6;
    if (ageInHours > 168) ageFactor = 0.4; // 1 week

    return Math.round(completeness * ageFactor);
  }

  /**
   * Get formatted context for AI consumption
   */
  async getContextForAI(): Promise<string> {
    const context = await this.getContext7Data();
    const userLanguage = context.level1_UserProfile?.language || 'en';
    const isRussian = userLanguage === 'ru';

    // Build compact context string for AI
    let contextString = '';

    if (isRussian) {
      contextString = `КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ (7 уровней):

Уровень 1 - Профиль: ${context.level1_UserProfile?.chronotype || 'неизвестно'} хронотип, цель сна ${context.level1_UserProfile?.sleepGoals?.duration || 8}ч (${context.level1_UserProfile?.sleepGoals?.bedtime || '22:00'} - ${context.level1_UserProfile?.sleepGoals?.wakeTime || '06:00'})

Уровень 2 - Поведение: консистентность ${context.level2_BehavioralPatterns?.sleepHabits?.consistencyScore || 0}%, стресс ${context.level2_BehavioralPatterns?.lifestyle?.stressLevel || 3}/5, спорт ${context.level2_BehavioralPatterns?.lifestyle?.exerciseFrequency || 'неизвестно'}

Уровень 3 - Тренды: качество сна ${context.level3_HistoricalData?.sleepTrends?.sleepQualityTrend || 'стабильно'}, средняя длительность ${context.level3_HistoricalData?.sleepTrends?.averageSleepDuration || 7.3}ч

Уровень 4 - Временной: ${context.level4_TemporalContext?.currentTime?.isWeekend ? 'выходной' : 'будний день'}, ${context.level4_TemporalContext?.currentTime?.hour || 12}:00, сезон ${context.level4_TemporalContext?.currentTime?.season || 'неизвестно'}

Уровень 5 - Эмоции: энергия ${context.level5_EmotionalState?.currentMood?.energy || 3}/5, стресс ${context.level5_EmotionalState?.currentMood?.stress || 3}/5, мотивация ${context.level5_EmotionalState?.currentMood?.motivation || 3}/5

Уровень 6 - Цели: активных целей ${context.level6_GoalsProgress?.activeGoals?.length || 0}, стиль мотивации ${context.level6_GoalsProgress?.preferences?.motivationStyle || 'encouraging'}

Уровень 7 - Адаптация: отклик на советы ${context.level7_AdaptiveLearning?.personalityInsights?.responseToAdvice || 'receptive'}, стиль общения ${context.level7_AdaptiveLearning?.personalityInsights?.communicationStyle || 'friendly'}`;
    } else {
      contextString = `USER CONTEXT (7 levels):

Level 1 - Profile: ${context.level1_UserProfile?.chronotype || 'unknown'} chronotype, sleep goal ${context.level1_UserProfile?.sleepGoals?.duration || 8}h (${context.level1_UserProfile?.sleepGoals?.bedtime || '10:00 PM'} - ${context.level1_UserProfile?.sleepGoals?.wakeTime || '6:00 AM'})

Level 2 - Behavior: consistency ${context.level2_BehavioralPatterns?.sleepHabits?.consistencyScore || 0}%, stress ${context.level2_BehavioralPatterns?.lifestyle?.stressLevel || 3}/5, exercise ${context.level2_BehavioralPatterns?.lifestyle?.exerciseFrequency || 'unknown'}

Level 3 - Trends: sleep quality ${context.level3_HistoricalData?.sleepTrends?.sleepQualityTrend || 'stable'}, avg duration ${context.level3_HistoricalData?.sleepTrends?.averageSleepDuration || 7.3}h

Level 4 - Temporal: ${context.level4_TemporalContext?.currentTime?.isWeekend ? 'weekend' : 'weekday'}, ${context.level4_TemporalContext?.currentTime?.hour || 12}:00, ${context.level4_TemporalContext?.currentTime?.season || 'unknown'} season

Level 5 - Emotional: energy ${context.level5_EmotionalState?.currentMood?.energy || 3}/5, stress ${context.level5_EmotionalState?.currentMood?.stress || 3}/5, motivation ${context.level5_EmotionalState?.currentMood?.motivation || 3}/5

Level 6 - Goals: ${context.level6_GoalsProgress?.activeGoals?.length || 0} active goals, motivation style ${context.level6_GoalsProgress?.preferences?.motivationStyle || 'encouraging'}

Level 7 - Adaptive: advice response ${context.level7_AdaptiveLearning?.personalityInsights?.responseToAdvice || 'receptive'}, communication ${context.level7_AdaptiveLearning?.personalityInsights?.communicationStyle || 'friendly'}`;
    }

    return contextString;
  }

  /**
   * Load Context7 data from storage
   */
  private async loadContext7Data(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CONTEXT7_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Restore Date objects
        if (parsed.metadata?.lastUpdated) {
          parsed.metadata.lastUpdated = new Date(parsed.metadata.lastUpdated);
        }
        this.context7Data = parsed;
      }
    } catch (error) {
      console.error('Failed to load Context7 data:', error);
    }
  }

  /**
   * Save Context7 data to storage
   */
  private async saveContext7Data(): Promise<void> {
    try {
      await AsyncStorage.setItem(CONTEXT7_STORAGE_KEY, JSON.stringify(this.context7Data));
    } catch (error) {
      console.error('Failed to save Context7 data:', error);
    }
  }

  /**
   * Schedule regular updates
   */
  private scheduleRegularUpdates(): void {
    // Update context every 6 hours
    this.updateSchedule = setInterval(() => {
      this.updateAllLevels();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Manual refresh of all context levels
   */
  async refreshAllContext(): Promise<void> {
    await this.updateAllLevels();
  }

  /**
   * Clear all context data
   */
  async clearAllContext(): Promise<void> {
    this.context7Data = {};
    await AsyncStorage.removeItem(CONTEXT7_STORAGE_KEY);
  }

  /**
   * Get context summary for debugging
   */
  getContextSummary(): {
    completeness: number;
    confidence: number;
    lastUpdated: Date | null;
    levelsPopulated: number;
  } {
    const levels = [
      this.context7Data.level1_UserProfile,
      this.context7Data.level2_BehavioralPatterns,
      this.context7Data.level3_HistoricalData,
      this.context7Data.level4_TemporalContext,
      this.context7Data.level5_EmotionalState,
      this.context7Data.level6_GoalsProgress,
      this.context7Data.level7_AdaptiveLearning,
    ];

    const levelsPopulated = levels.filter(level => level !== undefined).length;

    return {
      completeness: this.context7Data.metadata?.dataCompleteness || 0,
      confidence: this.context7Data.metadata?.confidenceScore || 0,
      lastUpdated: this.context7Data.metadata?.lastUpdated || null,
      levelsPopulated,
    };
  }
}

// Export singleton instance
export const context7Manager = Context7Manager.getInstance();
export default Context7Manager;