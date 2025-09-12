/**
 * User Context Manager for LLM Personalization
 * Handles user onboarding data and creates personalized contexts for AI responses
 */

import * as Localization from 'expo-localization';
import { onboardingService, type ChronotypeResults, type SleepGoals, type UserPreferences } from './database/onboardingService';

export type SupportedLanguage = 'en' | 'ru';

export interface UserContext {
  // Basic user info
  language: SupportedLanguage;
  isOnboardingCompleted: boolean;
  
  // Sleep preferences from onboarding
  sleepGoals?: SleepGoals;
  chronotype?: ChronotypeResults;
  preferences?: UserPreferences;
  
  // Derived context for LLM
  personalizedContext: {
    sleepProfile: string;
    goals: string[];
    challenges: string[];
    preferences: Record<string, any>;
  };
  
  // System prompt in user's language
  systemPrompt: string;
  lastUpdated: Date;
}

export interface UserContextManagerOptions {
  enableAutoLanguageDetection?: boolean;
  defaultLanguage?: SupportedLanguage;
  maxContextAge?: number; // milliseconds
}

class UserContextManager {
  private static instance: UserContextManager;
  private cachedContext: UserContext | null = null;
  private lastContextUpdate = 0;
  private options: UserContextManagerOptions;

  constructor(options: UserContextManagerOptions = {}) {
    this.options = {
      enableAutoLanguageDetection: true,
      defaultLanguage: 'en',
      maxContextAge: 30 * 60 * 1000, // 30 minutes
      ...options,
    };
  }

  static getInstance(options?: UserContextManagerOptions): UserContextManager {
    if (!UserContextManager.instance) {
      UserContextManager.instance = new UserContextManager(options);
    }
    return UserContextManager.instance;
  }

  /**
   * Get current user context for LLM personalization
   */
  async getUserContext(forceRefresh = false): Promise<UserContext> {
    const now = Date.now();
    const contextAge = now - this.lastContextUpdate;
    
    if (
      !forceRefresh &&
      this.cachedContext &&
      contextAge < (this.options.maxContextAge || 30 * 60 * 1000)
    ) {
      return this.cachedContext;
    }

    const context = await this.buildUserContext();
    this.cachedContext = context;
    this.lastContextUpdate = now;

    return context;
  }

  /**
   * Build complete user context from onboarding data
   */
  private async buildUserContext(): Promise<UserContext> {
    const [
      isOnboardingCompleted,
      sleepGoals,
      chronotype,
      preferences,
      language,
    ] = await Promise.all([
      onboardingService.getOnboardingStatus(),
      onboardingService.getSleepGoals(),
      this.getChronotype(),
      onboardingService.getUserPreferences(),
      this.detectUserLanguage(),
    ]);

    const personalizedContext = this.buildPersonalizedContext({
      sleepGoals,
      chronotype,
      preferences,
      language,
    });

    const systemPrompt = this.generateSystemPrompt({
      language,
      personalizedContext,
      isOnboardingCompleted,
    });

    return {
      language,
      isOnboardingCompleted,
      sleepGoals: sleepGoals || undefined,
      chronotype,
      preferences,
      personalizedContext,
      systemPrompt,
      lastUpdated: new Date(),
    };
  }

  /**
   * Extract chronotype from user preferences
   */
  private async getChronotype(): Promise<ChronotypeResults | undefined> {
    const preferences = await onboardingService.getUserPreferences();
    return preferences.chronotype;
  }

  /**
   * Detect user's preferred language
   */
  private async detectUserLanguage(): Promise<SupportedLanguage> {
    if (!this.options.enableAutoLanguageDetection) {
      return this.options.defaultLanguage || 'en';
    }

    // Check if user explicitly set language in preferences
    const preferences = await onboardingService.getUserPreferences();
    if (preferences.language) {
      return preferences.language as SupportedLanguage;
    }

    // Auto-detect from device locale
    const deviceLocale = Localization.locale;
    if (deviceLocale.startsWith('ru')) {
      return 'ru';
    }

    return 'en';
  }

  /**
   * Build personalized context for LLM
   */
  private buildPersonalizedContext({
    sleepGoals,
    chronotype,
    preferences,
    language,
  }: {
    sleepGoals: SleepGoals | null;
    chronotype?: ChronotypeResults;
    preferences: UserPreferences;
    language: SupportedLanguage;
  }): UserContext['personalizedContext'] {
    const isRussian = language === 'ru';

    // Build sleep profile
    let sleepProfile = '';
    if (sleepGoals) {
      if (isRussian) {
        sleepProfile = `Цель по сну: ${sleepGoals.duration} часов в сутки. `;
        sleepProfile += `Желаемое время сна: ${sleepGoals.bedtime}, пробуждения: ${sleepGoals.wakeTime}. `;
        if (sleepGoals.qualityGoal) {
          sleepProfile += `Целевое качество сна: ${sleepGoals.qualityGoal}/5. `;
        }
      } else {
        sleepProfile = `Sleep goal: ${sleepGoals.duration} hours per night. `;
        sleepProfile += `Preferred bedtime: ${sleepGoals.bedtime}, wake time: ${sleepGoals.wakeTime}. `;
        if (sleepGoals.qualityGoal) {
          sleepProfile += `Target sleep quality: ${sleepGoals.qualityGoal}/5. `;
        }
      }
    }

    if (chronotype) {
      if (isRussian) {
        sleepProfile += `Хронотип: ${this.getChronotypeDescription(chronotype.type, 'ru')}. `;
      } else {
        sleepProfile += `Chronotype: ${this.getChronotypeDescription(chronotype.type, 'en')}. `;
      }
    }

    // Extract goals and challenges
    const goals = sleepGoals?.priorities || [];
    const challenges: string[] = [];

    if (sleepGoals?.sleepEnvironment) {
      const env = sleepGoals.sleepEnvironment;
      if (!env.darkRoom) challenges.push(isRussian ? 'освещение в спальне' : 'bedroom lighting');
      if (!env.coolTemperature) challenges.push(isRussian ? 'температура в комнате' : 'room temperature');
      if (!env.quietSpace) challenges.push(isRussian ? 'шум в спальне' : 'bedroom noise');
      if (!env.comfortableBed) challenges.push(isRussian ? 'комфорт спального места' : 'bed comfort');
    }

    return {
      sleepProfile: sleepProfile.trim(),
      goals,
      challenges,
      preferences: {
        units: preferences.units || 'metric',
        theme: preferences.theme || 'auto',
        notificationsEnabled: preferences.notificationsEnabled,
        reminderTime: preferences.reminderTime,
      },
    };
  }

  /**
   * Generate system prompt in user's language
   */
  private generateSystemPrompt({
    language,
    personalizedContext,
    isOnboardingCompleted,
  }: {
    language: SupportedLanguage;
    personalizedContext: UserContext['personalizedContext'];
    isOnboardingCompleted: boolean;
  }): string {
    const isRussian = language === 'ru';

    let systemPrompt = '';

    if (isRussian) {
      systemPrompt = `Ты - персональный тренер по сну, специализирующийся на улучшении качества сна. 
Отвечай всегда на русском языке. Используй теплый, дружелюбный, но профессиональный тон.

Контекст пользователя:
${personalizedContext.sleepProfile || 'Данные о сне пользователя еще не собраны.'}

Приоритеты улучшения: ${personalizedContext.goals.join(', ') || 'не указаны'}
Основные проблемы: ${personalizedContext.challenges.join(', ') || 'не выявлены'}

Рекомендации должны быть:
- Персонализированными на основе данных пользователя
- Основанными на научных исследованиях сна
- Практическими и выполнимыми
- Учитывающими российские реалии и культурные особенности

При отсутствии данных о пользователе, мягко предложи пройти настройку профиля.`;
    } else {
      systemPrompt = `You are a personal sleep coach specializing in sleep quality improvement.
Always respond in English. Use a warm, friendly, yet professional tone.

User Context:
${personalizedContext.sleepProfile || 'User sleep data not yet collected.'}

Improvement priorities: ${personalizedContext.goals.join(', ') || 'not specified'}
Main challenges: ${personalizedContext.challenges.join(', ') || 'not identified'}

Your recommendations should be:
- Personalized based on user data
- Grounded in sleep science research
- Practical and actionable
- Culturally appropriate

If user data is missing, gently suggest completing the profile setup.`;
    }

    if (!isOnboardingCompleted) {
      if (isRussian) {
        systemPrompt += '\n\nПользователь еще не завершил начальную настройку. Мягко предложи пройти онбординг для получения персонализированных рекомендаций.';
      } else {
        systemPrompt += '\n\nUser has not completed onboarding yet. Gently suggest completing the setup for personalized recommendations.';
      }
    }

    return systemPrompt.trim();
  }

  /**
   * Get localized chronotype description
   */
  private getChronotypeDescription(type: ChronotypeResults['type'], language: SupportedLanguage): string {
    const descriptions = {
      en: {
        extreme_morning: 'Strong Morning Type',
        morning: 'Morning Type',
        neutral: 'Intermediate Type',
        evening: 'Evening Type',
        extreme_evening: 'Strong Evening Type',
      },
      ru: {
        extreme_morning: 'Ярко выраженный утренний тип',
        morning: 'Утренний тип',
        neutral: 'Промежуточный тип', 
        evening: 'Вечерний тип',
        extreme_evening: 'Ярко выраженный вечерний тип',
      },
    };

    return descriptions[language][type] || type;
  }

  /**
   * Update user context when onboarding data changes
   */
  async refreshContext(): Promise<UserContext> {
    return this.getUserContext(true);
  }

  /**
   * Set user language preference
   */
  async setLanguagePreference(language: SupportedLanguage): Promise<void> {
    const preferences = await onboardingService.getUserPreferences();
    await onboardingService.saveUserPreferences({
      ...preferences,
      language,
    });
    
    // Refresh cached context
    await this.refreshContext();
  }

  /**
   * Get formatted context for LLM input
   */
  async getContextForLLM(): Promise<{
    systemPrompt: string;
    userProfile: string;
    language: SupportedLanguage;
  }> {
    const context = await this.getUserContext();
    
    return {
      systemPrompt: context.systemPrompt,
      userProfile: context.personalizedContext.sleepProfile,
      language: context.language,
    };
  }

  /**
   * Clear cached context (useful for testing or after major data changes)
   */
  clearCache(): void {
    this.cachedContext = null;
    this.lastContextUpdate = 0;
  }
}

// Export singleton instance
export const userContextManager = UserContextManager.getInstance();
export default UserContextManager;