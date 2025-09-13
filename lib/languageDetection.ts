/**
 * Language Detection System for Multilingual Chat
 * Detects user message language and maintains conversation context
 */

import * as Localization from 'expo-localization';

export type SupportedLanguage = 'en' | 'ru';
export type LanguageConfidence = 'high' | 'medium' | 'low';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: LanguageConfidence;
  score: number; // 0-1
  alternativeLanguages?: Array<{
    language: SupportedLanguage;
    score: number;
  }>;
}

export interface LanguageContext {
  preferredLanguage?: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  conversationLanguage?: SupportedLanguage; // Language of current conversation
  lastDetection?: LanguageDetectionResult;
  detectionHistory: LanguageDetectionResult[];
  isLanguageMixed?: boolean; // User switches between languages
}

class LanguageDetectionService {
  private static instance: LanguageDetectionService;
  private context: LanguageContext = {
    detectionHistory: [],
  };

  // Russian language indicators (most common patterns)
  private russianPatterns = [
    // Cyrillic characters
    /[\u0400-\u04FF]+/,
    
    // Common Russian words and phrases
    /\b(как|что|где|когда|почему|зачем|кто|который|какой|сон|спать|ночь|утро|вечер|время|часов|минут)\b/i,
    /\b(привет|здравствуй|спасибо|пожалуйста|извини|до свидания)\b/i,
    /\b(хочу|могу|должен|нужно|надо|можно|нельзя|люблю|знаю)\b/i,
    /\b(сегодня|вчера|завтра|сейчас|потом|всегда|никогда|часто)\b/i,
    /\b(хороший|плохой|большой|маленький|красивый|умный|быстрый)\b/i,
    
    // Sleep-related Russian terms
    /\b(засыпать|просыпаться|бессонница|дремать|храпеть|сновидение|кошмар|подушка|кровать|матрас)\b/i,
    /\b(усталость|энергия|отдых|расслабление|стресс|беспокойство)\b/i,
  ];

  // English language indicators
  private englishPatterns = [
    // English articles and prepositions (very specific to English)
    /\b(the|a|an|in|on|at|to|for|of|with|by|from|about|into|through|during)\b/i,
    
    // Common English words
    /\b(how|what|where|when|why|who|which|sleep|night|morning|evening|time|hours|minutes)\b/i,
    /\b(hello|hi|thanks|please|sorry|goodbye|yes|no|maybe|sure|okay)\b/i,
    /\b(want|can|should|need|must|may|will|would|could|love|know)\b/i,
    /\b(today|yesterday|tomorrow|now|later|always|never|often|sometimes)\b/i,
    /\b(good|bad|big|small|beautiful|smart|fast|slow|happy|sad)\b/i,
    
    // Sleep-related English terms
    /\b(fall asleep|wake up|insomnia|nap|snore|dream|nightmare|pillow|bed|mattress)\b/i,
    /\b(tired|fatigue|energy|rest|relax|stress|anxiety|sleepy|drowsy)\b/i,
  ];

  // Common mixed language indicators
  private mixedPatterns = [
    // English words commonly used in Russian context
    /\b(ok|okay|well|actually|really|super|cool|wow|omg)\b/i,
    
    // Numbers and time expressions (language-neutral but context matters)
    /\b\d{1,2}:\d{2}\b/, // time format
    /\b\d+\s*(час|часа|часов|hour|hours|min|minutes|минут)\b/i,
  ];

  static getInstance(): LanguageDetectionService {
    if (!LanguageDetectionService.instance) {
      LanguageDetectionService.instance = new LanguageDetectionService();
    }
    return LanguageDetectionService.instance;
  }

  /**
   * Detect language of a given text message
   */
  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return this.getDefaultDetection();
    }

    const normalizedText = text.toLowerCase().trim();
    
    // Calculate scores for each language
    const russianScore = this.calculateLanguageScore(normalizedText, this.russianPatterns);
    const englishScore = this.calculateLanguageScore(normalizedText, this.englishPatterns);
    const mixedScore = this.calculateLanguageScore(normalizedText, this.mixedPatterns);

    // Consider conversation context
    const contextualScores = this.applyContextualBoost({
      russian: russianScore,
      english: englishScore,
    });

    // Determine primary language
    let primaryLanguage: SupportedLanguage;
    let confidence: LanguageConfidence;
    let finalScore: number;

    if (contextualScores.russian > contextualScores.english) {
      primaryLanguage = 'ru';
      finalScore = contextualScores.russian;
    } else {
      primaryLanguage = 'en';
      finalScore = contextualScores.english;
    }

    // Determine confidence level
    const scoreDifference = Math.abs(contextualScores.russian - contextualScores.english);
    if (finalScore > 0.7 && scoreDifference > 0.3) {
      confidence = 'high';
    } else if (finalScore > 0.4 && scoreDifference > 0.15) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    const result: LanguageDetectionResult = {
      language: primaryLanguage,
      confidence,
      score: finalScore,
      alternativeLanguages: [
        {
          language: primaryLanguage === 'ru' ? 'en' : 'ru',
          score: primaryLanguage === 'ru' ? contextualScores.english : contextualScores.russian,
        },
      ],
    };

    // Update context
    this.updateContext(result);

    return result;
  }

  /**
   * Calculate language score based on pattern matching
   */
  private calculateLanguageScore(text: string, patterns: RegExp[]): number {
    let matches = 0;
    let totalScore = 0;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        matches++;
        // Weight longer matches higher
        const matchLength = match[0].length;
        totalScore += Math.min(matchLength / 10, 1);
      }
    }

    // Normalize score based on text length and number of patterns
    const textLengthFactor = Math.min(text.length / 50, 1);
    const matchDensity = matches / patterns.length;
    
    return Math.min(totalScore * matchDensity * textLengthFactor, 1);
  }

  /**
   * Apply contextual boost based on conversation history
   */
  private applyContextualBoost(scores: { russian: number; english: number }): { russian: number; english: number } {
    const boost = 0.2; // 20% boost for consistent language usage
    
    // Boost score for language consistent with recent conversation
    if (this.context.conversationLanguage) {
      if (this.context.conversationLanguage === 'ru') {
        scores.russian += boost;
      } else {
        scores.english += boost;
      }
    }

    // Boost score for preferred language (smaller boost)
    if (this.context.preferredLanguage) {
      const preferenceBoost = 0.1;
      if (this.context.preferredLanguage === 'ru') {
        scores.russian += preferenceBoost;
      } else {
        scores.english += preferenceBoost;
      }
    }

    // Ensure scores don't exceed 1.0
    scores.russian = Math.min(scores.russian, 1.0);
    scores.english = Math.min(scores.english, 1.0);

    return scores;
  }

  /**
   * Get default language detection when text is empty or unclear
   */
  private getDefaultDetection(): LanguageDetectionResult {
    const preferredLang = this.context.preferredLanguage || this.getDeviceLanguage();
    
    return {
      language: preferredLang,
      confidence: 'low',
      score: 0.1,
    };
  }

  /**
   * Get device language setting
   */
  getDeviceLanguage(): SupportedLanguage {
    const locale = Localization.getLocales()[0]?.languageCode;
    return locale?.startsWith('ru') ? 'ru' : 'en';
  }

  /**
   * Update language context based on detection result
   */
  private updateContext(result: LanguageDetectionResult): void {
    // Add to history
    this.context.detectionHistory.push(result);
    
    // Keep only last 10 detections for performance
    if (this.context.detectionHistory.length > 10) {
      this.context.detectionHistory = this.context.detectionHistory.slice(-10);
    }

    // Update last detection
    this.context.lastDetection = result;

    // Update conversation language if confidence is high
    if (result.confidence === 'high') {
      this.context.conversationLanguage = result.language;
    }

    // Detect mixed language usage
    const recentDetections = this.context.detectionHistory.slice(-5);
    const languages = new Set(recentDetections.map(d => d.language));
    this.context.isLanguageMixed = languages.size > 1;
  }

  /**
   * Set user's preferred language
   */
  setPreferredLanguage(language: SupportedLanguage): void {
    this.context.preferredLanguage = language;
    this.context.conversationLanguage = language;
  }

  /**
   * Get current conversation language
   */
  getConversationLanguage(): SupportedLanguage {
    return this.context.conversationLanguage || 
           this.context.preferredLanguage || 
           this.getDeviceLanguage();
  }

  /**
   * Check if user tends to mix languages
   */
  isLanguageMixed(): boolean {
    return this.context.isLanguageMixed || false;
  }

  /**
   * Reset language context (useful for new conversations)
   */
  resetContext(): void {
    const preferredLanguage = this.context.preferredLanguage;
    this.context = {
      preferredLanguage,
      detectionHistory: [],
    };
  }

  /**
   * Get language context for debugging or analytics
   */
  getContext(): LanguageContext {
    return { ...this.context };
  }

  /**
   * Smart language detection that considers message content and context
   */
  detectWithContext(text: string, conversationHistory?: Array<{ text: string; language?: SupportedLanguage }>): LanguageDetectionResult {
    // Consider recent conversation if provided
    if (conversationHistory && conversationHistory.length > 0) {
      const recentLanguages = conversationHistory
        .slice(-3) // Last 3 messages
        .map(msg => msg.language)
        .filter(Boolean) as SupportedLanguage[];
      
      if (recentLanguages.length > 0) {
        const mostCommonLanguage = this.getMostCommonLanguage(recentLanguages);
        this.context.conversationLanguage = mostCommonLanguage;
      }
    }

    return this.detectLanguage(text);
  }

  /**
   * Get most common language from array
   */
  private getMostCommonLanguage(languages: SupportedLanguage[]): SupportedLanguage {
    const counts = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<SupportedLanguage, number>);

    return Object.entries(counts).reduce((a, b) => 
      counts[a[0] as SupportedLanguage] > counts[b[0] as SupportedLanguage] ? a : b
    )[0] as SupportedLanguage;
  }
}

// Export singleton instance
export const languageDetector = LanguageDetectionService.getInstance();
export default LanguageDetectionService;