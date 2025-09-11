/**
 * AI Chat Service for Lunar Sleep App
 * Provides context-aware responses based on user sleep data and patterns
 */

export interface SleepData {
  date: string;
  duration: number; // hours
  bedtime: string;
  wakeTime: string;
  sleepScore: number; // 0-100
  deepSleep: number; // hours
  remSleep: number; // hours
  lightSleep: number; // hours
  awakenings: number;
  efficiency: number; // percentage
}

export interface ChatContext {
  userProfile?: {
    name?: string;
    chronotype?: 'morning' | 'evening' | 'intermediate';
    sleepGoal?: number; // hours
    preferredBedtime?: string;
  };
  recentSleepData?: SleepData[];
  conversationHistory?: Array<{
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
  }>;
}

export class SleepAIService {
  private static instance: SleepAIService;
  private context: ChatContext = {};

  static getInstance(): SleepAIService {
    if (!SleepAIService.instance) {
      SleepAIService.instance = new SleepAIService();
    }
    return SleepAIService.instance;
  }

  updateContext(context: Partial<ChatContext>) {
    this.context = { ...this.context, ...context };
  }

  async generateResponse(userMessage: string): Promise<{
    text: string;
    type: 'insight' | 'recommendation' | 'question' | 'text';
    confidence: number; // 0-1
    richContent?: {
      type: 'sleep_score' | 'sleep_trend' | 'sleep_phases' | 'bedtime_recommendation' | 'environment_tip' | 'progress_tracker' | 'sleep_comparison';
      data: any;
      metadata?: {
        title?: string;
        subtitle?: string;
        timestamp?: Date;
      };
    };
  }> {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Analyze message intent
    const intent = this.analyzeIntent(normalizedMessage);
    
    // Generate contextual response
    const response = await this.generateContextualResponse(intent, normalizedMessage);
    
    return response;
  }

  private analyzeIntent(message: string): {
    category: string;
    keywords: string[];
    urgency: 'low' | 'medium' | 'high';
  } {
    const patterns = {
      sleepAnalysis: ['analyze', 'trend', 'pattern', 'data', 'report', 'summary'],
      lastNightSleep: ['last night', 'yesterday', 'recent', 'latest sleep'],
      sleepImprovement: ['improve', 'better', 'help', 'fix', 'optimize', 'enhance'],
      bedtimeAdvice: ['bedtime', 'when sleep', 'best time', 'optimal'],
      sleepProblems: ['trouble', 'problem', 'insomnia', 'cant sleep', 'restless'],
      sleepScore: ['score', 'rating', 'quality', 'how good'],
      chronotype: ['morning person', 'night owl', 'chronotype', 'natural rhythm'],
      environment: ['room', 'temperature', 'noise', 'light', 'dark'],
      routine: ['routine', 'habit', 'schedule', 'before bed', 'wind down'],
      duration: ['hours', 'long enough', 'too much', 'too little'],
    };

    let matchedCategory = 'general';
    let matchedKeywords: string[] = [];
    let urgency: 'low' | 'medium' | 'high' = 'low';

    for (const [category, keywords] of Object.entries(patterns)) {
      const matches = keywords.filter(keyword => 
        message.includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        matchedCategory = category;
        matchedKeywords = matches;
        
        // Determine urgency based on problem-related keywords
        if (['sleepProblems', 'sleepImprovement'].includes(category)) {
          urgency = 'high';
        } else if (['lastNightSleep', 'sleepScore'].includes(category)) {
          urgency = 'medium';
        }
        break;
      }
    }

    return {
      category: matchedCategory,
      keywords: matchedKeywords,
      urgency,
    };
  }

  private async generateContextualResponse(
    intent: { category: string; keywords: string[]; urgency: 'low' | 'medium' | 'high' },
    message: string
  ): Promise<{
    text: string;
    type: 'insight' | 'recommendation' | 'question' | 'text';
    confidence: number;
    richContent?: {
      type: 'sleep_score' | 'sleep_trend' | 'sleep_phases' | 'bedtime_recommendation' | 'environment_tip' | 'progress_tracker' | 'sleep_comparison';
      data: any;
      metadata?: {
        title?: string;
        subtitle?: string;
        timestamp?: Date;
      };
    };
  }> {
    const { category } = intent;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    switch (category) {
      case 'lastNightSleep':
        return this.generateLastNightAnalysis();
        
      case 'sleepAnalysis':
        return this.generateTrendAnalysis();
        
      case 'sleepImprovement':
        return this.generateImprovementRecommendations();
        
      case 'bedtimeAdvice':
        return this.generateBedtimeAdvice();
        
      case 'sleepProblems':
        return this.generateProblemSolving(message);
        
      case 'sleepScore':
        return this.generateScoreExplanation();
        
      case 'chronotype':
        return this.generateChronotypeAdvice();
        
      case 'environment':
        return this.generateEnvironmentAdvice();
        
      case 'routine':
        return this.generateRoutineAdvice();
        
      case 'duration':
        return this.generateDurationAdvice();
        
      default:
        return this.generateGeneralResponse();
    }
  }

  private generateLastNightAnalysis() {
    // Mock data - in real app, this would come from actual sleep tracking
    const mockData = {
      duration: 7.4,
      score: 78,
      deepSleep: 1.8,
      remSleep: 1.9,
      lightSleep: 3.4,
      awake: 0.3,
      efficiency: 87,
      bedtime: '10:45 PM',
      wakeTime: '6:15 AM',
    };

    const insights = [];
    
    if (mockData.score >= 80) {
      insights.push('Great sleep quality overall!');
    } else if (mockData.score >= 70) {
      insights.push('Good sleep with room for improvement.');
    } else {
      insights.push('Your sleep could use some attention.');
    }

    if (mockData.deepSleep < 1.5) {
      insights.push('Your deep sleep was a bit low - try keeping your room cooler.');
    }

    if (mockData.efficiency < 85) {
      insights.push('You spent some time awake in bed - consider relaxation techniques.');
    }

    return {
      text: `Here's your detailed sleep analysis from last night. Your sleep score shows ${mockData.score >= 80 ? 'excellent' : mockData.score >= 70 ? 'good' : 'moderate'} quality with specific insights about each sleep phase.`,
      type: 'insight' as const,
      confidence: 0.9,
      richContent: {
        type: 'sleep_score' as const,
        data: {
          score: mockData.score,
          previousScore: 72,
          insights: insights,
          duration: mockData.duration,
          bedtime: mockData.bedtime,
          wakeTime: mockData.wakeTime,
          efficiency: mockData.efficiency,
        },
        metadata: {
          title: "Last Night's Sleep",
          subtitle: "Detailed analysis and insights",
          timestamp: new Date(),
        }
      }
    };
  }

  private generateTrendAnalysis() {
    // Mock trend data
    const trendData = [65, 68, 70, 73, 75, 78, 80, 82, 79, 81, 84, 82, 80, 78];
    
    return {
      text: `Your sleep trends show significant improvement over the past month! Your average sleep score increased from 72 to 78, with particularly strong performance mid-week. Here's your detailed trend analysis.`,
      type: 'insight' as const,
      confidence: 0.95,
      richContent: {
        type: 'sleep_trend' as const,
        data: {
          data: trendData,
          period: 'Last 30 days',
          trend: 'improving',
          averageImprovement: 6,
          bestWeek: 'Week 3',
          focusArea: 'Weekend consistency'
        },
        metadata: {
          title: 'Sleep Trends',
          subtitle: '30-day improvement analysis',
          timestamp: new Date(),
        }
      }
    };
  }

  private generateImprovementRecommendations() {
    return {
      text: `**Personalized Sleep Improvement Plan** ✨\n\n**Top 3 Recommendations** (based on your data):\n\n**1. Optimize Your Sleep Environment** 🌡️\n• Keep bedroom temperature 65-68°F (18-20°C)\n• Use blackout curtains or eye mask\n• Consider white noise or earplugs\n\n**2. Perfect Your Wind-Down Routine** 🧘‍♀️\n• Start dimming lights 2 hours before bed\n• No screens 1 hour before sleep\n• Try 10 minutes of meditation or reading\n\n**3. Maintain Consistency** ⏰\n• Go to bed within 30 minutes of 10:15 PM every night\n• Wake up at the same time, even on weekends\n• Avoid "sleeping in" more than 1 hour\n\n**Quick Win**: Start with just the temperature - many users see immediate improvement!\n\nWhich area would you like to focus on first?`,
      type: 'recommendation' as const,
      confidence: 0.92,
    };
  }

  private generateBedtimeAdvice() {
    return {
      text: `Based on your sleep patterns and chronotype analysis, I've calculated your optimal bedtime to maximize sleep quality and align with your natural rhythm.`,
      type: 'recommendation' as const,
      confidence: 0.88,
      richContent: {
        type: 'bedtime_recommendation' as const,
        data: {
          optimalBedtime: '10:15 PM',
          currentBedtime: '10:45 PM',
          adjustment: 'Move 30 minutes earlier',
          reasoning: 'Aligns better with your natural melatonin production and maximizes deep sleep during your optimal window (11 PM - 2 AM).',
          benefits: [
            'Natural 30-minute fall-asleep time',
            'Full 8 hours before 6:30 AM wake',
            'Maximizes deep sleep phase',
            'Better weekend consistency'
          ]
        },
        metadata: {
          title: 'Optimal Bedtime',
          subtitle: 'Personalized recommendation',
          timestamp: new Date(),
        }
      }
    };
  }

  private generateProblemSolving(message: string) {
    if (message.includes('cant sleep') || message.includes('insomnia')) {
      return {
        text: `**Trouble Falling Asleep? Let's Fix This** 😴\n\n**Immediate Strategies**:\n\n**Tonight** 🌃\n• Try the 4-7-8 breathing technique\n• Keep a notepad next to bed for racing thoughts\n• If not asleep in 20 minutes, get up and do a quiet activity\n\n**This Week** 📅\n• Move your bedtime 15 minutes earlier each night\n• No caffeine after 2 PM\n• Get 10 minutes of morning sunlight within 1 hour of waking\n\n**Long-term** 🎯\n• Establish a consistent 60-minute wind-down routine\n• Keep your bedroom cool (65-68°F)\n• Consider meditation or progressive muscle relaxation\n\n**Red Flags**: If this continues for more than 2 weeks, consider talking to a healthcare provider.\n\nWhat time did you try to fall asleep last night?`,
        type: 'recommendation' as const,
        confidence: 0.85,
      };
    }

    return {
      text: `I understand you're having some sleep challenges. Can you tell me more specifically about what's bothering you? For example:\n\n• Trouble falling asleep?\n• Waking up during the night?\n• Waking up too early?\n• Feeling tired despite sleeping?\n• Irregular sleep schedule?\n\nThe more details you share, the better I can help you with personalized advice!`,
      type: 'question' as const,
      confidence: 0.7,
    };
  }

  private generateScoreExplanation() {
    return {
      text: `Let me break down your sleep score and show you exactly how each sleep phase contributed to your overall rating. Understanding these phases can help you optimize your sleep quality.`,
      type: 'insight' as const,
      confidence: 0.93,
      richContent: {
        type: 'sleep_phases' as const,
        data: {
          deep: 1.8,
          rem: 1.9,
          light: 3.4,
          awake: 0.3,
          duration: 7.4,
          efficiency: 87,
          breakdown: {
            duration: 85,
            efficiency: 87,
            deepSleep: 72,
            consistency: 76,
            rem: 80
          }
        },
        metadata: {
          title: 'Sleep Phases Analysis',
          subtitle: 'Last night breakdown',
          timestamp: new Date(),
        }
      }
    };
  }

  private generateChronotypeAdvice() {
    return {
      text: `**Your Chronotype Analysis** 🦉\n\nBased on your sleep patterns, you appear to be an **intermediate chronotype** with slight evening tendencies.\n\n**What this means**:\n• Natural bedtime: 10-11 PM\n• Peak alertness: 10 AM - 2 PM and 6-8 PM\n• Best for exercise: 6-7 PM\n• Most creative: Early evening (4-7 PM)\n\n**Working with your natural rhythm**:\n• Schedule important tasks during peak hours\n• Avoid early morning meetings when possible\n• Use your evening energy burst productively\n• Don't fight your natural bedtime\n\n**Productivity tip**: Save routine tasks for your energy dips (2-4 PM), and tackle challenging work during your peaks!\n\nHave you noticed these energy patterns in your daily life?`,
      type: 'insight' as const,
      confidence: 0.8,
    };
  }

  private generateEnvironmentAdvice() {
    return {
      text: `**Optimizing Your Sleep Environment** 🏠\n\n**Temperature Control** 🌡️\n• Ideal range: 65-68°F (18-20°C)\n• Your body temperature naturally drops before sleep\n• Cool room = deeper sleep\n\n**Light Management** 💡\n• Blackout curtains or eye mask\n• Red light bulbs for evening (blue light disrupts melatonin)\n• Morning light within 1 hour of waking\n\n**Sound Environment** 🔇\n• White noise machine or earplugs\n• Consistent, gentle sounds are better than silence\n• Avoid sudden noises (turn off notifications)\n\n**Air Quality** 🌬️\n• Keep bedroom well-ventilated\n• Consider an air purifier if you have allergies\n• Humidity around 30-50%\n\n**Quick wins**: Start with temperature and light - these typically show results within a few days!\n\nWhat's your current bedroom setup like?`,
      type: 'recommendation' as const,
      confidence: 0.87,
    };
  }

  private generateRoutineAdvice() {
    return {
      text: `**Build the Perfect Sleep Routine** 🧘‍♀️\n\n**2 Hours Before Bed** (8:15 PM)\n• Finish eating and drinking caffeine\n• Begin dimming lights throughout your home\n• Start quiet, relaxing activities\n\n**1 Hour Before Bed** (9:15 PM)\n• No more screens (phones, TV, computers)\n• Take a warm bath or shower\n• Light stretching or meditation\n• Prepare tomorrow's outfit/tasks\n\n**30 Minutes Before Bed** (9:45 PM)\n• Final bathroom visit\n• Read a physical book or journal\n• Practice gratitude or gentle breathing\n\n**Bedtime** (10:15 PM)\n• In bed, lights out\n• If not sleepy, try progressive muscle relaxation\n• Avoid checking the clock\n\n**The key**: Consistency! Your brain learns when it's time to sleep through these cues.\n\n**Start small**: Pick just 2-3 elements to begin with, then build up your routine gradually.\n\nWhat part of your current routine works best for you?`,
      type: 'recommendation' as const,
      confidence: 0.91,
    };
  }

  private generateDurationAdvice() {
    return {
      text: `**Sleep Duration: Finding Your Sweet Spot** ⏰\n\n**Your Current Pattern**: Averaging 7.3 hours\n**Optimal Range**: Most adults need 7-9 hours\n\n**Quality vs. Quantity**:\n• 7 hours of efficient sleep > 8 hours of restless sleep\n• Your sleep efficiency is more important than total time\n\n**Signs you need more sleep**:\n• Feeling tired despite "enough" hours\n• Needing caffeine to function\n• Getting sick frequently\n• Mood changes or irritability\n\n**Signs you might be oversleeping**:\n• Feeling groggy after 9+ hours\n• Difficulty falling asleep at night\n• Sleeping in makes you feel worse\n\n**Your optimal duration**: Based on your data, aim for **7.5-8 hours**. You seem to function well on this amount, and your efficiency scores are highest in this range.\n\n**Strategy**: Gradually adjust by 15-minute increments until you wake up naturally feeling refreshed.\n\nHow do you feel with your current sleep duration?`,
      type: 'insight' as const,
      confidence: 0.86,
    };
  }

  private generateGeneralResponse() {
    const responses = [
      {
        text: `I'm here to help you sleep better! I can provide insights about:\n\n• Your sleep patterns and trends\n• Personalized recommendations\n• Bedtime optimization\n• Sleep environment tips\n• Troubleshooting sleep issues\n\nWhat aspect of your sleep would you like to explore today?`,
        type: 'question' as const,
        confidence: 0.7,
      },
      {
        text: `That's a great question! To give you the most helpful advice, could you tell me more about what specific aspect of your sleep you're curious about? \n\nFor example: your sleep quality, duration, bedtime routine, or any challenges you're facing?`,
        type: 'question' as const,
        confidence: 0.6,
      },
      {
        text: `I'd be happy to help with your sleep! Based on your recent data, you're doing well overall. Is there something specific about your sleep patterns or quality that you'd like me to analyze or help improve?`,
        type: 'text' as const,
        confidence: 0.5,
      },
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export const sleepAI = SleepAIService.getInstance();

// Mock sleep data for development
export const mockSleepData: SleepData[] = [
  {
    date: '2024-01-08',
    duration: 7.4,
    bedtime: '10:45 PM',
    wakeTime: '6:15 AM',
    sleepScore: 78,
    deepSleep: 1.8,
    remSleep: 1.9,
    lightSleep: 3.4,
    awakenings: 2,
    efficiency: 87,
  },
  {
    date: '2024-01-07',
    duration: 8.1,
    bedtime: '10:15 PM',
    wakeTime: '6:20 AM',
    sleepScore: 84,
    deepSleep: 2.1,
    remSleep: 2.2,
    lightSleep: 3.6,
    awakenings: 1,
    efficiency: 92,
  },
  // Add more mock data as needed
];