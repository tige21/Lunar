/**
 * Multilingual DeepSeek Service
 * High-level service that orchestrates all components for intelligent sleep coaching
 */

import { deepseekService, type SleepChatResponse } from './deepseekService';
import { userContextManager, type UserContext } from './userContextManager';
import { languageDetector, type SupportedLanguage, type LanguageDetectionResult } from './languageDetection';
import { contextPromptTemplates, type PromptOptions } from './contextPromptTemplates';

export interface MultilingualChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  language: SupportedLanguage;
  type: 'insight' | 'recommendation' | 'question' | 'text';
  status: 'sending' | 'sent' | 'error';
  confidence?: number;
  cached?: boolean;
  retryCount?: number;
}

export interface ChatSessionContext {
  sessionId: string;
  startTime: Date;
  messageCount: number;
  primaryLanguage: SupportedLanguage;
  languageSwitches: number;
  userContext: UserContext;
  lastActivity: Date;
}

export interface MultilingualServiceOptions {
  enableAutoLanguageDetection?: boolean;
  enableContextPersonalization?: boolean;
  enableResponseCaching?: boolean;
  promptOptions?: PromptOptions;
  sessionTimeout?: number; // milliseconds
}

class MultilingualDeepSeekService {
  private static instance: MultilingualDeepSeekService;
  private options: Required<MultilingualServiceOptions>;
  private currentSession: ChatSessionContext | null = null;
  private conversationHistory: MultilingualChatMessage[] = [];

  constructor(options: MultilingualServiceOptions = {}) {
    this.options = {
      enableAutoLanguageDetection: true,
      enableContextPersonalization: true,
      enableResponseCaching: true,
      promptOptions: {
        includePersonalization: true,
        includeScientificBasis: true,
        includeCulturalContext: true,
        responseLength: 'concise',
        tone: 'friendly',
      },
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...options,
    };
  }

  static getInstance(options?: MultilingualServiceOptions): MultilingualDeepSeekService {
    if (!MultilingualDeepSeekService.instance) {
      MultilingualDeepSeekService.instance = new MultilingualDeepSeekService(options);
    }
    return MultilingualDeepSeekService.instance;
  }

  /**
   * Generate intelligent multilingual response
   */
  async generateResponse(userMessage: string, context?: {
    conversationHistory?: Array<{ text: string; language?: SupportedLanguage }>;
    forceLanguage?: SupportedLanguage;
  }): Promise<MultilingualChatMessage> {
    try {
      // Initialize or update session
      await this.ensureSession();

      // Detect language with context
      const languageDetection = this.detectLanguageWithHistory(userMessage, context?.conversationHistory);
      const detectedLanguage = context?.forceLanguage || languageDetection.language;

      // Update language context
      if (this.currentSession!.primaryLanguage !== detectedLanguage) {
        this.currentSession!.languageSwitches++;
        this.currentSession!.primaryLanguage = detectedLanguage;
      }

      // Update user context if personalization enabled
      if (this.options.enableContextPersonalization) {
        await userContextManager.refreshContext();
        this.currentSession!.userContext = await userContextManager.getUserContext();
      }

      // Set language preference in services
      deepseekService.setLanguagePreference(detectedLanguage);
      languageDetector.setPreferredLanguage(detectedLanguage);

      // Generate response using DeepSeek
      const sleepResponse = await deepseekService.generateResponse(userMessage);

      // Create multilingual message
      const responseMessage = this.createMultilingualMessage({
        text: sleepResponse.text,
        language: detectedLanguage,
        type: sleepResponse.type,
        confidence: sleepResponse.confidence,
        cached: sleepResponse.cached,
        isUser: false,
      });

      // Update conversation history
      const userMsg = this.createMultilingualMessage({
        text: userMessage,
        language: detectedLanguage,
        isUser: true,
      });

      this.addToConversationHistory(userMsg);
      this.addToConversationHistory(responseMessage);

      // Update session
      this.updateSession();

      return responseMessage;

    } catch (error) {
      console.error('Multilingual service error:', error);
      
      // Generate fallback response
      return this.generateFallbackResponse(userMessage, error);
    }
  }

  /**
   * Detect language with conversation history context
   */
  private detectLanguageWithHistory(
    message: string,
    history?: Array<{ text: string; language?: SupportedLanguage }>
  ): LanguageDetectionResult {
    if (!this.options.enableAutoLanguageDetection) {
      return {
        language: 'en',
        confidence: 'medium',
        score: 0.7,
      };
    }

    return languageDetector.detectWithContext(message, history);
  }

  /**
   * Create multilingual message object
   */
  private createMultilingualMessage(params: {
    text: string;
    language: SupportedLanguage;
    type?: 'insight' | 'recommendation' | 'question' | 'text';
    confidence?: number;
    cached?: boolean;
    isUser: boolean;
    retryCount?: number;
  }): MultilingualChatMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: params.text,
      isUser: params.isUser,
      timestamp: new Date(),
      language: params.language,
      type: params.type || 'text',
      status: 'sent',
      confidence: params.confidence,
      cached: params.cached,
      retryCount: params.retryCount || 0,
    };
  }

  /**
   * Generate fallback response on error
   */
  private generateFallbackResponse(userMessage: string, error: any): MultilingualChatMessage {
    const detectedLanguage = languageDetector.getConversationLanguage();
    
    let fallbackText = '';
    if (detectedLanguage === 'ru') {
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        fallbackText = 'Извините, у меня проблемы с подключением. Попробуйте еще раз через несколько секунд. Тем временем, помните о важности регулярного режима сна! 😴';
      } else {
        fallbackText = 'Простите, произошла техническая ошибка. Я работаю над решением проблемы. Попробуйте переформулировать вопрос о сне.';
      }
    } else {
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        fallbackText = 'Sorry, I\'m having connection issues. Please try again in a few seconds. In the meantime, remember the importance of a regular sleep schedule! 😴';
      } else {
        fallbackText = 'I apologize, there was a technical error. I\'m working on fixing it. Please try rephrasing your sleep question.';
      }
    }

    return this.createMultilingualMessage({
      text: fallbackText,
      language: detectedLanguage,
      type: 'text',
      confidence: 0.5,
      isUser: false,
    });
  }

  /**
   * Ensure session is active
   */
  private async ensureSession(): Promise<void> {
    const now = Date.now();
    
    if (!this.currentSession || 
        (now - this.currentSession.lastActivity.getTime()) > this.options.sessionTimeout) {
      
      // Create new session
      const userContext = await userContextManager.getUserContext();
      
      this.currentSession = {
        sessionId: `session-${now}`,
        startTime: new Date(),
        messageCount: 0,
        primaryLanguage: userContext.language,
        languageSwitches: 0,
        userContext,
        lastActivity: new Date(),
      };

      // Clear old conversation history
      this.conversationHistory = [];
      deepseekService.clearHistory();
      languageDetector.resetContext();
    }
  }

  /**
   * Update session activity
   */
  private updateSession(): void {
    if (this.currentSession) {
      this.currentSession.messageCount++;
      this.currentSession.lastActivity = new Date();
    }
  }

  /**
   * Add message to conversation history
   */
  private addToConversationHistory(message: MultilingualChatMessage): void {
    this.conversationHistory.push(message);
    
    // Keep only last 50 messages for performance
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Switch conversation language
   */
  async switchLanguage(newLanguage: SupportedLanguage): Promise<void> {
    // Update user preferences
    await userContextManager.setLanguagePreference(newLanguage);
    
    // Update service preferences
    deepseekService.setLanguagePreference(newLanguage);
    languageDetector.setPreferredLanguage(newLanguage);
    
    // Update session
    if (this.currentSession) {
      this.currentSession.primaryLanguage = newLanguage;
      this.currentSession.languageSwitches++;
      
      // Refresh user context with new language
      this.currentSession.userContext = await userContextManager.getUserContext(true);
    }
  }

  /**
   * Get conversation summary for analytics
   */
  getConversationSummary(): {
    messageCount: number;
    primaryLanguage: SupportedLanguage;
    languageSwitches: number;
    averageResponseTime: number;
    topicCategories: string[];
    sessionDuration: number;
  } {
    if (!this.currentSession) {
      return {
        messageCount: 0,
        primaryLanguage: 'en',
        languageSwitches: 0,
        averageResponseTime: 0,
        topicCategories: [],
        sessionDuration: 0,
      };
    }

    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime.getTime();
    
    // Analyze message types for topic categories
    const messageTypes = this.conversationHistory
      .filter(msg => !msg.isUser)
      .map(msg => msg.type);
    
    const topicCategories = [...new Set(messageTypes)];

    return {
      messageCount: this.currentSession.messageCount,
      primaryLanguage: this.currentSession.primaryLanguage,
      languageSwitches: this.currentSession.languageSwitches,
      averageResponseTime: sessionDuration / Math.max(this.currentSession.messageCount, 1),
      topicCategories,
      sessionDuration,
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    deepseekConnectivity: boolean;
    userContextLoaded: boolean;
    languageDetectionWorking: boolean;
    cacheStatus: 'healthy' | 'warning' | 'error';
    lastError?: string;
  }> {
    try {
      const [
        deepseekHealthy,
        userContext,
        languageTest,
        cacheStats,
      ] = await Promise.all([
        deepseekService.testConnection(),
        userContextManager.getUserContext().catch(() => null),
        Promise.resolve(languageDetector.detectLanguage('test message')),
        Promise.resolve(deepseekService.getStats()),
      ]);

      return {
        deepseekConnectivity: deepseekHealthy,
        userContextLoaded: !!userContext,
        languageDetectionWorking: !!languageTest,
        cacheStatus: cacheStats.cacheSize > 100 ? 'warning' : 'healthy',
      };
    } catch (error) {
      return {
        deepseekConnectivity: false,
        userContextLoaded: false,
        languageDetectionWorking: false,
        cacheStatus: 'error',
        lastError: error.message,
      };
    }
  }

  /**
   * Clear all data (for logout/reset)
   */
  clearAllData(): void {
    this.currentSession = null;
    this.conversationHistory = [];
    deepseekService.clearHistory();
    deepseekService.clearCache();
    languageDetector.resetContext();
    userContextManager.clearCache();
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): MultilingualChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Retry failed message
   */
  async retryMessage(messageId: string): Promise<MultilingualChatMessage | null> {
    const messageIndex = this.conversationHistory.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return null;

    const failedMessage = this.conversationHistory[messageIndex];
    if (!failedMessage.isUser) return null;

    try {
      // Remove failed response if exists
      if (messageIndex + 1 < this.conversationHistory.length) {
        this.conversationHistory.splice(messageIndex + 1, 1);
      }

      // Generate new response
      const newResponse = await this.generateResponse(failedMessage.text);
      return newResponse;
    } catch (error) {
      console.error('Retry failed:', error);
      return null;
    }
  }

  /**
   * Update service options
   */
  updateOptions(newOptions: Partial<MultilingualServiceOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}

// Export singleton instance
export const multilingualDeepSeekService = MultilingualDeepSeekService.getInstance();
export default MultilingualDeepSeekService;