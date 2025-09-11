/**
 * AI Service
 * Handles AI-powered insights, chat, and recommendations
 */

import type { SleepData } from './sleepService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation';
}

export interface SleepInsight {
  id: string;
  title: string;
  description: string;
  category: 'sleep_quality' | 'duration' | 'timing' | 'environment' | 'lifestyle';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations?: string[];
}

export class AIService {
  private static instance: AIService;
  private apiKey: string | null = null;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialize AI service with API key
   */
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Generate personalized insights from sleep data
   */
  async generateInsights(sleepData: SleepData): Promise<SleepInsight[]> {
    // Mock AI insights - in production, this would call an AI service
    const insights: SleepInsight[] = [];

    // Sleep efficiency insight
    if (sleepData.efficiency < 85) {
      insights.push({
        id: 'efficiency-low',
        title: 'Sleep Efficiency Could Improve',
        description: `Your sleep efficiency is ${sleepData.efficiency}%. Aim for 85% or higher for optimal rest.`,
        category: 'sleep_quality',
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Establish a consistent bedtime routine',
          'Limit screen time before bed',
          'Keep your bedroom cool and dark'
        ]
      });
    }

    // Deep sleep insight
    if (sleepData.phases.deep < 20) {
      insights.push({
        id: 'deep-sleep-low',
        title: 'Boost Your Deep Sleep',
        description: `You're getting ${sleepData.phases.deep}% deep sleep. Aim for 20-25% for better recovery.`,
        category: 'sleep_quality',
        priority: 'high',
        actionable: true,
        recommendations: [
          'Avoid caffeine after 2 PM',
          'Exercise earlier in the day',
          'Try a warm bath before bed'
        ]
      });
    }

    // REM sleep insight
    if (sleepData.phases.rem < 18) {
      insights.push({
        id: 'rem-sleep-low',
        title: 'REM Sleep Needs Attention',
        description: `Your REM sleep is at ${sleepData.phases.rem}%. REM supports memory and emotional processing.`,
        category: 'sleep_quality',
        priority: 'medium',
        actionable: true,
        recommendations: [
          'Aim for 7-9 hours total sleep',
          'Manage stress with meditation',
          'Avoid alcohol before bedtime'
        ]
      });
    }

    return insights;
  }

  /**
   * Chat with AI about sleep
   */
  async chat(message: string, context?: { sleepData?: SleepData }): Promise<ChatMessage> {
    // Mock AI response - in production, this would call an AI API
    const responses = [
      "I'd be happy to help you improve your sleep! Based on your recent patterns, I notice some areas we could work on together.",
      "Great question! Sleep is complex, and there are many factors that can affect quality. Let me share some personalized insights.",
      "I can see from your data that you're making progress. Here are some specific recommendations for you.",
      "That's a common concern. Many people struggle with similar sleep challenges. Let's explore some solutions."
    ];

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      type: 'text'
    };
  }

  /**
   * Get sleep recommendations based on patterns
   */
  async getRecommendations(sleepHistory: SleepData[]): Promise<string[]> {
    // Mock recommendations - in production, this would use ML models
    const recommendations = [
      'Try going to bed 15 minutes earlier for better sleep duration',
      'Your sleep quality improves on days when you exercise - keep it up!',
      'Consider a sleep mask to improve your deep sleep phases',
      'Your weekend sleep patterns differ significantly - try to keep consistent',
      'Room temperature seems to affect your sleep - aim for 65-68°F'
    ];

    return recommendations.slice(0, 2 + Math.floor(Math.random() * 3));
  }

  /**
   * Analyze sleep trends and predict patterns
   */
  async analyzeTrends(sleepHistory: SleepData[]): Promise<{
    trend: 'improving' | 'stable' | 'declining';
    prediction: string;
    confidence: number;
  }> {
    // Mock trend analysis
    const trends = ['improving', 'stable', 'declining'] as const;
    const predictions = [
      'Your sleep quality is likely to continue improving with current habits',
      'Maintain your current routine for stable sleep patterns',
      'Consider adjusting your bedtime routine to reverse the declining trend'
    ];

    const trendIndex = Math.floor(Math.random() * trends.length);
    
    return {
      trend: trends[trendIndex],
      prediction: predictions[trendIndex],
      confidence: 0.7 + Math.random() * 0.25 // 70-95%
    };
  }

  /**
   * Generate sleep coaching plan
   */
  async generateCoachingPlan(sleepData: SleepData): Promise<{
    title: string;
    duration: string;
    goals: string[];
    weeklyTasks: string[];
  }> {
    // Mock coaching plan
    return {
      title: 'Personalized Sleep Improvement Plan',
      duration: '4 weeks',
      goals: [
        'Increase sleep efficiency to 90%',
        'Improve deep sleep to 25%',
        'Reduce time to fall asleep to under 10 minutes'
      ],
      weeklyTasks: [
        'Week 1: Establish consistent bedtime (+/- 30 min)',
        'Week 2: Optimize sleep environment (temperature, light, noise)',
        'Week 3: Develop pre-sleep routine (no screens 1 hour before bed)',
        'Week 4: Fine-tune diet and exercise timing for better sleep'
      ]
    };
  }
}

export default AIService.getInstance();