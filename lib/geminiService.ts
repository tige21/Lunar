/**
 * Google Gemini API Service for Multilingual Sleep Coach
 * Handles API calls to Gemini with Russian/English support and personalized context
 * 
 * Model: gemini-2.0-flash-lite (Free tier optimized)
 * Rate Limits: 30 RPM, 1M TPM, 200 RPD for free tier
 * Features: Context7 integration, rate limiting, caching, multilingual support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { userContextManager, type UserContext } from './userContextManager';
import { context7Manager } from './context7Manager';
import { languageDetector, type SupportedLanguage } from './languageDetection';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const STORAGE_KEY = '@gemini_response_cache';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
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

export interface GeminiServiceOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  enableCaching?: boolean;
  cacheDuration?: number; // minutes
  timeout?: number; // milliseconds
  enableRateLimit?: boolean; // Rate limit protection for free tier
  rateLimitPerMinute?: number; // Free tier: 30 RPM for flash-lite
}

class GeminiService {
  private static instance: GeminiService;
  private options: Required<GeminiServiceOptions>;
  private conversationHistory: GeminiMessage[] = [];
  private responseCache = new Map<string, { response: SleepChatResponse; timestamp: number }>();
  private requestTimestamps: number[] = []; // Track request times for rate limiting

  constructor(options: GeminiServiceOptions = {}) {
    this.options = {
      model: 'gemini-2.0-flash-lite',
      temperature: 0.7,
      maxOutputTokens: 800,
      topP: 0.95,
      topK: 40,
      enableCaching: true,
      cacheDuration: 60, // 1 hour
      timeout: 15000, // 15 seconds
      enableRateLimit: true, // Enable rate limiting for free tier
      rateLimitPerMinute: 30, // Gemini 2.0 Flash-Lite free tier limit
      ...options,
    };

    this.loadCacheFromStorage();
  }

  static getInstance(options?: GeminiServiceOptions): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService(options);
    }
    return GeminiService.instance;
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

      // Check rate limits for free tier
      if (this.options.enableRateLimit && !this.checkRateLimit()) {
        const waitTime = this.getWaitTimeForRateLimit();
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime/1000)} seconds before making another request.`);
      }

      // Get user context and optimized Context7 data
      const userContext = await userContextManager.getUserContext();
      // Use priority context for faster response, full context loads in background
      const context7Data = await context7Manager.getContextForAI();
      
      // Build messages with enhanced context
      const messages = await this.buildMessages(userMessage, detectedLanguage, userContext, context7Data);

      // Make API call and record request for rate limiting
      this.recordRequest();
      const response = await this.callGeminiAPI(messages);

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
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  /**
   * Build message array with system prompt and user context
   */
  private async buildMessages(
    userMessage: string, 
    language: SupportedLanguage,
    userContext: UserContext,
    context7Data: string
  ): Promise<GeminiMessage[]> {
    const messages: GeminiMessage[] = [];

    // Build system prompt with personalization and Context7
    const systemPrompt = await this.buildSystemPrompt(language, userContext, context7Data);
    
    // Add system message (converted to user message with instructions)
    messages.push({
      role: 'user',
      parts: [{ text: systemPrompt }],
    });

    // Add model acknowledgment
    messages.push({
      role: 'model',
      parts: [{ text: language === 'ru' ? 'Понял, я буду выступать в роли персонального тренера по сну согласно указанным инструкциям.' : 'Understood, I will act as a personal sleep coach according to the provided instructions.' }],
    });

    // Add relevant conversation history (last 4 exchanges)
    const recentHistory = this.conversationHistory.slice(-8); // 4 user + 4 model messages
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    return messages;
  }

  /**
   * Build personalized system prompt based on language and user context
   */
  private async buildSystemPrompt(language: SupportedLanguage, userContext: UserContext, context7Data: string): Promise<string> {
    const isRussian = language === 'ru';
    const { personalizedContext } = userContext;

    let systemPrompt = '';

    if (isRussian) {
      systemPrompt = `Ты - персональный тренер по сну, специализирующийся на улучшении качества сна.
Отвечай ТОЛЬКО на русском языке. Используй теплый, дружелюбный, но профессиональный тон.

БАЗОВЫЙ КОНТЕКСТ:
${personalizedContext.sleepProfile || 'Данные о сне пользователя еще не собраны.'}

ПРИОРИТЕТЫ: ${personalizedContext.goals.join(', ') || 'не указаны'}
ОСНОВНЫЕ ВЫЗОВЫ: ${personalizedContext.challenges.join(', ') || 'не выявлены'}

РАСШИРЕННЫЙ КОНТЕКСТ (Context7):
${context7Data}

ПРАВИЛА ОТВЕТА:
- Отвечай кратко и по существу (максимум 3-4 абзаца)
- Используй всю информацию из 7-уровневого контекста для максимально персонализированных советов
- Учитывай время дня, день недели, сезон, настроение и цели пользователя
- Адаптируй стиль ответа под предпочтения пользователя из контекста
- Используй научно обоснованные рекомендации
- Учитывай российские реалии и культурные особенности
- При отсутствии данных мягко предложи настроить профиль
- Избегай медицинских диагнозов, рекомендуй врача при серьезных проблемах

СТИЛЬ: Как опытный друг-эксперт, который знает пользователя очень хорошо и искренне заботится о его сне.`;
    } else {
      systemPrompt = `You are a personal sleep coach specializing in sleep quality improvement.
Respond ONLY in English. Use a warm, friendly, yet professional tone.

BASIC CONTEXT:
${personalizedContext.sleepProfile || 'User sleep data not yet collected.'}

PRIORITIES: ${personalizedContext.goals.join(', ') || 'not specified'}
MAIN CHALLENGES: ${personalizedContext.challenges.join(', ') || 'not identified'}

ENHANCED CONTEXT (Context7):
${context7Data}

RESPONSE RULES:
- Keep responses concise and focused (maximum 3-4 paragraphs)
- Use all information from the 7-level context for highly personalized advice
- Consider time of day, day of week, season, mood, and user goals
- Adapt response style to user preferences from context
- Provide evidence-based recommendations
- If user data is missing, gently suggest completing profile setup
- Avoid medical diagnoses, recommend consulting professionals for serious issues

STYLE: Like an experienced friend-expert who knows the user very well and genuinely cares about their sleep quality.`;
    }

    return systemPrompt.trim();
  }

  /**
   * Make API call to Gemini
   */
  private async callGeminiAPI(messages: GeminiMessage[]): Promise<GeminiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(
        `${GEMINI_BASE_URL}/models/${this.options.model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: this.options.temperature,
              topK: this.options.topK,
              topP: this.options.topP,
              maxOutputTokens: this.options.maxOutputTokens,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
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
   * Process Gemini response and determine type
   */
  private processResponse(
    response: GeminiResponse, 
    language: SupportedLanguage,
    confidence: 'high' | 'medium' | 'low'
  ): SleepChatResponse {
    const content = response.candidates[0]?.content?.parts[0]?.text || '';
    
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
        prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
        completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
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
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: assistantMessage }] }
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
   * Check if request is within rate limits
   */
  private checkRateLimit(): boolean {
    if (!this.options.enableRateLimit) return true;

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

    // Check if we're under the limit
    return this.requestTimestamps.length < this.options.rateLimitPerMinute;
  }

  /**
   * Get wait time before next request is allowed (in milliseconds)
   */
  private getWaitTimeForRateLimit(): number {
    if (!this.options.enableRateLimit || this.requestTimestamps.length === 0) return 0;

    const oldestRequest = Math.min(...this.requestTimestamps);
    const oneMinuteFromOldest = oldestRequest + 60 * 1000;
    const now = Date.now();

    return Math.max(0, oneMinuteFromOldest - now);
  }

  /**
   * Record a request timestamp for rate limiting
   */
  private recordRequest(): void {
    if (this.options.enableRateLimit) {
      this.requestTimestamps.push(Date.now());
    }
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
      await this.callGeminiAPI([
        { role: 'user', parts: [{ text: 'You are a helpful assistant.' }] },
        { role: 'model', parts: [{ text: 'Hello! How can I help you today?' }] },
        { role: 'user', parts: [{ text: testMessage }] },
      ]);
      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();
export default GeminiService;