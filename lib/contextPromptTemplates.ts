/**
 * Context Prompt Templates for Multilingual Sleep Coaching
 * Advanced prompt templates with personalization and context awareness
 */

import type { UserContext } from './userContextManager';
import type { SupportedLanguage } from './languageDetection';

export interface PromptTemplate {
  systemPrompt: string;
  userContextPrompt: string;
  conversationStarters: string[];
  responseGuidelines: string[];
}

export interface PromptOptions {
  includePersonalization?: boolean;
  includeScientificBasis?: boolean;
  includeCulturalContext?: boolean;
  responseLength?: 'concise' | 'detailed' | 'comprehensive';
  tone?: 'professional' | 'friendly' | 'casual';
}

class ContextPromptTemplates {
  private static instance: ContextPromptTemplates;

  static getInstance(): ContextPromptTemplates {
    if (!ContextPromptTemplates.instance) {
      ContextPromptTemplates.instance = new ContextPromptTemplates();
    }
    return ContextPromptTemplates.instance;
  }

  /**
   * Generate complete prompt template for sleep coaching
   */
  generateSleepCoachTemplate(
    language: SupportedLanguage,
    userContext: UserContext,
    options: PromptOptions = {}
  ): PromptTemplate {
    const opts = {
      includePersonalization: true,
      includeScientificBasis: true,
      includeCulturalContext: true,
      responseLength: 'concise' as const,
      tone: 'friendly' as const,
      ...options,
    };

    if (language === 'ru') {
      return this.generateRussianTemplate(userContext, opts);
    } else {
      return this.generateEnglishTemplate(userContext, opts);
    }
  }

  /**
   * Russian language template
   */
  private generateRussianTemplate(userContext: UserContext, options: PromptOptions): PromptTemplate {
    const { personalizedContext } = userContext;
    
    let systemPrompt = `Ты - персональный AI-тренер по сну "Луна", специализирующийся на улучшении качества сна.

ТВОЯ РОЛЬ:
- Эксперт по сну с глубоким пониманием науки о сне
- Дружелюбный и заботливый наставник
- Персональный консультант, адаптирующий советы под конкретного пользователя

СТИЛЬ ОБЩЕНИЯ: ${this.getRussianToneDescription(options.tone!)}

ДЛИНА ОТВЕТОВ: ${this.getRussianLengthGuideline(options.responseLength!)}`;

    if (options.includePersonalization && personalizedContext.sleepProfile) {
      systemPrompt += `\n\nПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${personalizedContext.sleepProfile}

ЦЕЛИ УЛУЧШЕНИЯ: ${personalizedContext.goals.join(', ') || 'не указаны'}
ОСНОВНЫЕ ВЫЗОВЫ: ${personalizedContext.challenges.join(', ') || 'не выявлены'}`;
    }

    if (options.includeScientificBasis) {
      systemPrompt += `\n\nНАУЧНАЯ ОСНОВА:
- Основывайся на современных исследованиях сна
- Ссылайся на научные принципы циркадных ритмов
- Используй данные о фазах сна и их влиянии на здоровье
- Учитывай индивидуальные хронотипы`;
    }

    if (options.includeCulturalContext) {
      systemPrompt += `\n\nКУЛЬТУРНЫЙ КОНТЕКСТ:
- Учитывай российские реалии (климат, культура, образ жизни)
- Адаптируй рекомендации под местные условия
- Используй понятные российскому пользователю примеры
- Помни о культурных особенностях отношения ко сну`;
    }

    systemPrompt += `\n\nПРАВИЛА ОТВЕТА:
- Отвечай ТОЛЬКО на русском языке
- Избегай медицинских диагнозов
- При серьезных проблемах рекомендуй обратиться к врачу
- Будь позитивным и мотивирующим
- Давай конкретные, выполнимые советы
- Если данных недостаточно, мягко предложи дополнить профиль`;

    const userContextPrompt = this.buildRussianContextPrompt(personalizedContext);
    
    const conversationStarters = [
      "Как дела с вашим сном? Что хотели бы улучшить?",
      "Расскажите о своих привычках перед сном",
      "Какие проблемы со сном вас больше всего беспокоят?",
      "Как вы себя чувствуете утром после пробуждения?",
      "Что влияет на качество вашего сна?",
    ];

    const responseGuidelines = [
      "Начинай с эмпатии и понимания",
      "Давай персонализированные советы",
      "Объясняй 'почему' за каждой рекомендацией",
      "Предлагай постепенные изменения",
      "Заканчивай мотивирующей нотой",
    ];

    return {
      systemPrompt: systemPrompt.trim(),
      userContextPrompt,
      conversationStarters,
      responseGuidelines,
    };
  }

  /**
   * English language template  
   */
  private generateEnglishTemplate(userContext: UserContext, options: PromptOptions): PromptTemplate {
    const { personalizedContext } = userContext;
    
    let systemPrompt = `You are "Luna", a personal AI sleep coach specializing in sleep quality improvement.

YOUR ROLE:
- Sleep expert with deep understanding of sleep science
- Friendly and caring mentor
- Personal consultant adapting advice to individual users

COMMUNICATION STYLE: ${this.getEnglishToneDescription(options.tone!)}

RESPONSE LENGTH: ${this.getEnglishLengthGuideline(options.responseLength!)}`;

    if (options.includePersonalization && personalizedContext.sleepProfile) {
      systemPrompt += `\n\nUSER PROFILE:
${personalizedContext.sleepProfile}

IMPROVEMENT GOALS: ${personalizedContext.goals.join(', ') || 'not specified'}
MAIN CHALLENGES: ${personalizedContext.challenges.join(', ') || 'not identified'}`;
    }

    if (options.includeScientificBasis) {
      systemPrompt += `\n\nSCIENTIFIC BASIS:
- Base advice on current sleep research
- Reference circadian rhythm principles
- Use sleep phase science and health impacts
- Consider individual chronotypes`;
    }

    if (options.includeCulturalContext) {
      systemPrompt += `\n\nCULTURAL CONSIDERATIONS:
- Adapt recommendations to user's lifestyle
- Use relatable examples and references
- Consider cultural attitudes toward sleep
- Account for environmental factors`;
    }

    systemPrompt += `\n\nRESPONSE RULES:
- Respond ONLY in English
- Avoid medical diagnoses
- Recommend professional consultation for serious issues
- Be positive and motivating
- Give specific, actionable advice
- If data is insufficient, gently suggest profile completion`;

    const userContextPrompt = this.buildEnglishContextPrompt(personalizedContext);
    
    const conversationStarters = [
      "How's your sleep going? What would you like to improve?",
      "Tell me about your bedtime routine",
      "What sleep challenges concern you most?", 
      "How do you feel when you wake up in the morning?",
      "What affects the quality of your sleep?",
    ];

    const responseGuidelines = [
      "Start with empathy and understanding",
      "Provide personalized advice",
      "Explain the 'why' behind each recommendation",
      "Suggest gradual changes",
      "End with motivation",
    ];

    return {
      systemPrompt: systemPrompt.trim(),
      userContextPrompt,
      conversationStarters,
      responseGuidelines,
    };
  }

  /**
   * Build Russian context prompt
   */
  private buildRussianContextPrompt(context: UserContext['personalizedContext']): string {
    if (!context.sleepProfile) {
      return "Пользователь еще не настроил свой профиль сна. Мягко предложите пройти настройку для получения персонализированных рекомендаций.";
    }

    let prompt = `Контекст беседы:
Пользователь: ${context.sleepProfile}`;

    if (context.goals.length > 0) {
      prompt += `\nОсновные цели: ${context.goals.join(', ')}`;
    }

    if (context.challenges.length > 0) {
      prompt += `\nПроблемные области: ${context.challenges.join(', ')}`;
    }

    prompt += `\n\nПри ответе учитывайте этот контекст и давайте советы, релевантные для данного пользователя.`;

    return prompt;
  }

  /**
   * Build English context prompt
   */
  private buildEnglishContextPrompt(context: UserContext['personalizedContext']): string {
    if (!context.sleepProfile) {
      return "User hasn't set up their sleep profile yet. Gently suggest completing the profile setup for personalized recommendations.";
    }

    let prompt = `Conversation context:
User profile: ${context.sleepProfile}`;

    if (context.goals.length > 0) {
      prompt += `\nMain goals: ${context.goals.join(', ')}`;
    }

    if (context.challenges.length > 0) {
      prompt += `\nChallenge areas: ${context.challenges.join(', ')}`;
    }

    prompt += `\n\nConsider this context when responding and provide advice relevant to this specific user.`;

    return prompt;
  }

  /**
   * Russian tone descriptions
   */
  private getRussianToneDescription(tone: PromptOptions['tone']): string {
    switch (tone) {
      case 'professional': return 'Профессиональный, но теплый. Экспертные знания в доступной форме.';
      case 'friendly': return 'Дружелюбный и заботливый, как опытный друг-эксперт.';
      case 'casual': return 'Неформальный и расслабленный, легко общаться на любые темы.';
      default: return 'Дружелюбный и заботливый, как опытный друг-эксперт.';
    }
  }

  /**
   * English tone descriptions
   */
  private getEnglishToneDescription(tone: PromptOptions['tone']): string {
    switch (tone) {
      case 'professional': return 'Professional yet warm. Expert knowledge in accessible format.';
      case 'friendly': return 'Friendly and caring, like an experienced friend-expert.';
      case 'casual': return 'Casual and relaxed, easy to talk about anything.';
      default: return 'Friendly and caring, like an experienced friend-expert.';
    }
  }

  /**
   * Russian length guidelines
   */
  private getRussianLengthGuideline(length: PromptOptions['responseLength']): string {
    switch (length) {
      case 'concise': return 'Краткие ответы (2-3 абзаца). Сразу к делу, без лишних слов.';
      case 'detailed': return 'Подробные ответы (4-5 абзацев). Объясняй детали и приводи примеры.';
      case 'comprehensive': return 'Исчерпывающие ответы (5+ абзацев). Полный анализ и множество советов.';
      default: return 'Краткие ответы (2-3 абзаца). Сразу к делу, без лишних слов.';
    }
  }

  /**
   * English length guidelines
   */
  private getEnglishLengthGuideline(length: PromptOptions['responseLength']): string {
    switch (length) {
      case 'concise': return 'Concise responses (2-3 paragraphs). Get straight to the point.';
      case 'detailed': return 'Detailed responses (4-5 paragraphs). Explain details and provide examples.';
      case 'comprehensive': return 'Comprehensive responses (5+ paragraphs). Full analysis and multiple recommendations.';
      default: return 'Concise responses (2-3 paragraphs). Get straight to the point.';
    }
  }

  /**
   * Generate fallback prompts when user context is unavailable
   */
  generateFallbackPrompt(language: SupportedLanguage): string {
    if (language === 'ru') {
      return `Ты - AI-тренер по сну "Луна". Пользователь еще не настроил профиль сна.

Твоя задача:
- Дать общие, но полезные советы о сне
- Мягко предложить настроить профиль для персонализации
- Быть дружелюбным и мотивирующим
- Отвечать только на русском языке

Помни: даже без данных профиля ты можешь дать ценные общие советы о гигиене сна.`;
    } else {
      return `You are "Luna", an AI sleep coach. The user hasn't set up their sleep profile yet.

Your task:
- Provide general but helpful sleep advice
- Gently suggest profile setup for personalization
- Be friendly and motivating  
- Respond only in English

Remember: even without profile data, you can provide valuable general sleep hygiene advice.`;
    }
  }

  /**
   * Generate crisis/serious issue prompt
   */
  generateCrisisPrompt(language: SupportedLanguage): string {
    if (language === 'ru') {
      return `ВАЖНО: Если пользователь сообщает о серьезных проблемах (суицидальные мысли, тяжелая депрессия, панические атаки, хроническая бессонница более 2 недель), обязательно:

1. Вырази сочувствие и поддержку
2. Настоятельно рекомендуй обратиться к врачу
3. Предложи конкретные ресурсы помощи в России
4. НЕ давай медицинские советы
5. Подчеркни важность профессиональной помощи`;
    } else {
      return `IMPORTANT: If user reports serious issues (suicidal thoughts, severe depression, panic attacks, chronic insomnia >2 weeks), always:

1. Express empathy and support
2. Strongly recommend consulting a healthcare professional
3. Suggest specific help resources
4. DO NOT provide medical advice
5. Emphasize importance of professional help`;
    }
  }
}

// Export singleton instance
export const contextPromptTemplates = ContextPromptTemplates.getInstance();
export default ContextPromptTemplates;