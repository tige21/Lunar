/**
 * DeepSeek API Service for Multilingual Sleep Coach
 * Handles API calls to DeepSeek with Russian/English support and personalized context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { userContextManager, type UserContext } from './userContextManager';
import { languageDetector, type SupportedLanguage } from './languageDetection';

const DEEPSEEK_API_KEY = 'sk-76bc4a1b8bf74029a6f34f24b02104db';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const STORAGE_KEY = '@deepseek_response_cache';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SleepChatResponse {
  text: string;
  language: SupportedLanguage;
  type: 'insight' | 'recommendation' | 'question' | 'text';
  confidence: number;
  cached?: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface DeepSeekServiceOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  enableCaching?: boolean;
  cacheDuration?: number; // minutes
  timeout?: number; // milliseconds
}

class DeepSeekService {
  private static instance: DeepSeekService;
  private options: Required<DeepSeekServiceOptions>;
  private conversationHistory: DeepSeekMessage[] = [];
  private responseCache = new Map<string, { response: SleepChatResponse; timestamp: number }>();

  constructor(options: DeepSeekServiceOptions = {}) {
    this.options = {
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 800,
      enableCaching: true,
      cacheDuration: 60, // 1 hour
      timeout: 15000, // 15 seconds
      ...options,
    };

    this.loadCacheFromStorage();
  }

  static getInstance(options?: DeepSeekServiceOptions): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService(options);
    }
    return DeepSeekService.instance;
  }

  /**
   * Generate sleep coaching response with personalized context
   */
  async generateResponse(userMessage: string): Promise<SleepChatResponse> {
    try {
      // Detect message language
      const languageDetection = languageDetector.detectLanguage(userMessage);
      const detectedLanguage = languageDetection.language;

      // Check cache first
      if (this.options.enableCaching) {
        const cached = this.getCachedResponse(userMessage, detectedLanguage);
        if (cached) {
          return cached;
        }
      }

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No network connection');
      }

      // Get user context
      const userContext = await userContextManager.getUserContext();
      
      // Build messages with context
      const messages = await this.buildMessages(userMessage, detectedLanguage, userContext);

      // Make API call
      const response = await this.callDeepSeekAPI(messages);

      // Process response
      const sleepResponse = this.processResponse(response, detectedLanguage, languageDetection.confidence);

      // Cache the response
      if (this.options.enableCaching) {
        this.cacheResponse(userMessage, detectedLanguage, sleepResponse);
      }

      // Update conversation history
      this.updateConversationHistory(userMessage, sleepResponse.text);

      return sleepResponse;

    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  }

  /**
   * Build message array with system prompt and user context
   */
  private async buildMessages(
    userMessage: string, 
    language: SupportedLanguage,
    userContext: UserContext
  ): Promise<DeepSeekMessage[]> {
    const messages: DeepSeekMessage[] = [];

    // Add system prompt with personalization
    const systemPrompt = await this.buildSystemPrompt(language, userContext);
    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    // Add relevant conversation history (last 4 exchanges)
    const recentHistory = this.conversationHistory.slice(-8); // 4 user + 4 assistant messages
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Build personalized system prompt based on language and user context
   */
  private async buildSystemPrompt(language: SupportedLanguage, userContext: UserContext): Promise<string> {
    const isRussian = language === 'ru';
    const { personalizedContext } = userContext;

    let systemPrompt = '';

    if (isRussian) {
      systemPrompt = `Ты - персональный тренер по сну, специализирующийся на улучшении качества сна.
Отвечай ТОЛЬКО на русском языке. Используй теплый, дружелюбный, но профессиональный тон.

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
${personalizedContext.sleepProfile || 'Данные о сне пользователя еще не собраны.'}

ПРИОРИТЕТЫ: ${personalizedContext.goals.join(', ') || 'не указаны'}
ОСНОВНЫЕ ВЫЗОВЫ: ${personalizedContext.challenges.join(', ') || 'не выявлены'}

ПРАВИЛА ОТВЕТА:
- Отвечай кратко и по существу (максимум 3-4 абзаца)
- Давай персонализированные советы на основе данных пользователя
- Используй научно обоснованные рекомендации
- Учитывай российские реалии и культурные особенности
- При отсутствии данных мягко предложи настроить профиль
- Избегай медицинских диагнозов, рекомендуй врача при серьезных проблемах

СТИЛЬ: Как опытный друг-эксперт, который искренне заботится о качестве сна пользователя.`;
    } else {
      systemPrompt = `You are a personal sleep coach specializing in sleep quality improvement.
Respond ONLY in English. Use a warm, friendly, yet professional tone.

USER CONTEXT:
${personalizedContext.sleepProfile || 'User sleep data not yet collected.'}

PRIORITIES: ${personalizedContext.goals.join(', ') || 'not specified'}
MAIN CHALLENGES: ${personalizedContext.challenges.join(', ') || 'not identified'}

RESPONSE RULES:
- Keep responses concise and focused (maximum 3-4 paragraphs)
- Provide personalized advice based on user data
- Use evidence-based recommendations
- If user data is missing, gently suggest completing profile setup
- Avoid medical diagnoses, recommend consulting professionals for serious issues

STYLE: Like an experienced friend-expert who genuinely cares about the user's sleep quality.`;
    }

    return systemPrompt.trim();
  }

  /**
   * Make API call to DeepSeek
   */
  private async callDeepSeekAPI(messages: DeepSeekMessage[]): Promise<DeepSeekResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.options.model,
          messages,
          temperature: this.options.temperature,
          max_tokens: this.options.max_tokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Process DeepSeek response and determine type
   */
  private processResponse(
    response: DeepSeekResponse, 
    language: SupportedLanguage,
    confidence: 'high' | 'medium' | 'low'
  ): SleepChatResponse {
    const content = response.choices[0]?.message?.content || '';
    
    // Determine response type based on content
    const type = this.determineResponseType(content, language);
    
    // Map confidence to numeric value
    const confidenceScore = confidence === 'high' ? 0.9 : confidence === 'medium' ? 0.7 : 0.5;

    return {
      text: content.trim(),
      language,
      type,
      confidence: confidenceScore,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  /**
   * Determine response type based on content analysis
   */
  private determineResponseType(content: string, language: SupportedLanguage): SleepChatResponse['type'] {
    const lowerContent = content.toLowerCase();
    
    const patterns = {
      insight: language === 'ru' 
        ? /\b(анализ|данные|показывают|исследования|согласно|изучение|статистика)\b/
        : /\b(analysis|data|shows|research|according|study|statistics)\b/,
      
      recommendation: language === 'ru'
        ? /\b(рекомендую|советую|попробуйте|предлагаю|стоит|следует|нужно)\b/
        : /\b(recommend|suggest|try|should|consider|advise)\b/,
      
      question: language === 'ru'
        ? /\b(вопрос|спрашиваете|интересно|расскажите|поделитесь)\b/
        : /\b(question|asking|wondering|tell me|share)\b/,
    };

    if (patterns.insight.test(lowerContent)) return 'insight';
    if (patterns.recommendation.test(lowerContent)) return 'recommendation';
    if (patterns.question.test(lowerContent)) return 'question';
    
    return 'text';
  }

  /**
   * Update conversation history
   */
  private updateConversationHistory(userMessage: string, assistantMessage: string): void {
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    );

    // Keep only last 10 exchanges (20 messages)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(message: string, language: SupportedLanguage): string {
    const normalized = message.toLowerCase().trim().replace(/\s+/g, ' ');
    return `${language}:${normalized}`;
  }

  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse(message: string, language: SupportedLanguage): SleepChatResponse | null {
    const key = this.getCacheKey(message, language);
    const cached = this.responseCache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    const expirationTime = cached.timestamp + (this.options.cacheDuration * 60 * 1000);
    
    if (now > expirationTime) {
      this.responseCache.delete(key);
      return null;
    }
    
    return { ...cached.response, cached: true };
  }

  /**
   * Cache response
   */
  private cacheResponse(message: string, language: SupportedLanguage, response: SleepChatResponse): void {
    const key = this.getCacheKey(message, language);
    this.responseCache.set(key, {
      response: { ...response },
      timestamp: Date.now(),
    });

    // Save to persistent storage
    this.saveCacheToStorage();
  }

  /**
   * Load cache from AsyncStorage
   */
  private async loadCacheFromStorage(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        this.responseCache = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const data = Array.from(this.responseCache.entries());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Clear response cache
   */
  clearCache(): void {
    this.responseCache.clear();
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Set conversation language preference
   */
  setLanguagePreference(language: SupportedLanguage): void {
    languageDetector.setPreferredLanguage(language);
  }

  /**
   * Get service statistics
   */
  getStats(): {
    conversationLength: number;
    cacheSize: number;
    totalCachedResponses: number;
  } {
    return {
      conversationLength: this.conversationHistory.length / 2, // pairs of messages
      cacheSize: this.responseCache.size,
      totalCachedResponses: Array.from(this.responseCache.values())
        .filter(item => Date.now() - item.timestamp < (this.options.cacheDuration * 60 * 1000))
        .length,
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage = 'Hello';
      await this.callDeepSeekAPI([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: testMessage },
      ]);
      return true;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const deepseekService = DeepSeekService.getInstance();
export default DeepSeekService;