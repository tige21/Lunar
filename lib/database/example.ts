/**
 * Database service usage examples for Lunar Sleep Analysis App
 * This file demonstrates how to use the various database services
 * (FOR DEVELOPMENT AND TESTING PURPOSES ONLY)
 */

import {
  database,
  sleepService,
  userService,
  aiService,
  dataService,
  DatabaseManager,
  initializeDatabase,
  getQuickSleepSummary,
  createCompleteSleepSession
} from './index';

/**
 * Example: Initialize the database and perform basic operations
 */
export async function exampleBasicUsage() {
  try {
    console.log('=== Database Initialization ===');
    
    // Initialize database
    await initializeDatabase();
    console.log('✓ Database initialized');

    // Check health
    const health = await DatabaseManager.getHealthStatus();
    console.log('✓ Database health:', health);

    console.log('\n=== User Profile Setup ===');
    
    // Update user preferences
    const preferencesResult = await userService.updatePreferences('default_user', {
      theme: 'dark',
      notifications: {
        bedtimeReminder: true,
        bedtimeReminderTime: 30,
        wakeUpAlarm: true,
        weeklyInsights: true,
        goalAchievements: true,
        sleepQualityAlerts: true
      }
    });
    console.log('✓ Preferences updated:', preferencesResult.success);

    // Update health profile
    const healthResult = await userService.updateHealthProfile('default_user', {
      age: 30,
      gender: 'prefer_not_to_say',
      activityLevel: 'moderately_active',
      sleepDisorders: [],
      medications: []
    });
    console.log('✓ Health profile updated:', healthResult.success);

    // Set sleep goal
    const goalResult = await userService.setGoal('default_user', {
      targetBedtime: '23:00',
      targetWakeTime: '07:00',
      targetDuration: 480, // 8 hours
      targetQuality: 8,
      isActive: true
    });
    console.log('✓ Sleep goal set:', goalResult.success);

  } catch (error) {
    console.error('Example failed:', error);
  }
}

/**
 * Example: Create sample sleep sessions
 */
export async function exampleCreateSleepSessions() {
  try {
    console.log('\n=== Creating Sleep Sessions ===');

    // Create sample sleep sessions for the past week
    const sessions = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const sleepDate = new Date(now);
      sleepDate.setDate(sleepDate.getDate() - i);
      
      // Random bedtime between 22:00 and 24:00
      const bedtimeHour = 22 + Math.random() * 2;
      const bedtime = new Date(sleepDate);
      bedtime.setHours(Math.floor(bedtimeHour), Math.floor((bedtimeHour % 1) * 60), 0, 0);
      
      // Sleep duration between 6-9 hours
      const durationMinutes = 360 + Math.random() * 180;
      const wakeTime = new Date(bedtime.getTime() + durationMinutes * 60 * 1000);

      // Generate sleep stages (simplified)
      const stages = generateSampleSleepStages(bedtime, wakeTime);

      // Random quality scores
      const quality = {
        overall: 6 + Math.random() * 3, // 6-9
        efficiency: 75 + Math.random() * 20, // 75-95%
        restfulness: 6 + Math.random() * 3 // 6-9
      };

      const sessionResult = await createCompleteSleepSession({
        startTime: bedtime,
        endTime: wakeTime,
        stages,
        quality,
        notes: i === 0 ? 'Felt well rested' : undefined
      });

      if (sessionResult.success) {
        sessions.push(sessionResult.data);
        console.log(`✓ Created session ${i + 1}/7`);
      } else {
        console.error(`✗ Failed to create session ${i + 1}:`, sessionResult.error);
      }
    }

    console.log(`✓ Created ${sessions.length} sleep sessions`);
    return sessions;

  } catch (error) {
    console.error('Session creation failed:', error);
    return [];
  }
}

/**
 * Example: AI interactions and insights
 */
export async function exampleAIInteractions() {
  try {
    console.log('\n=== AI Interactions ===');

    // Start a conversation
    const conversationResult = await aiService.startConversation('default_user', 'Sleep Quality Analysis');
    if (!conversationResult.success) {
      throw new Error(conversationResult.error);
    }

    const conversationId = conversationResult.data!;
    console.log('✓ Started conversation:', conversationId);

    // User question
    await aiService.createInteraction('default_user', conversationId, {
      type: 'question',
      content: 'How has my sleep quality been this week?'
    });

    // AI response with insight
    await aiService.createInteraction('default_user', conversationId, {
      type: 'answer',
      content: 'Based on your recent sleep data, your average sleep quality has been 7.2/10 this week. I notice your deep sleep percentage is slightly below optimal at 18%. Here are some recommendations to improve...',
      metadata: {
        confidence: 85,
        dataPointsAnalyzed: 7,
        recommendations: [
          'Try to maintain consistent bedtime',
          'Limit screen time before bed',
          'Consider cooler room temperature'
        ]
      }
    });

    // Create an insight
    await aiService.createInsightInteraction('default_user', conversationId, {
      type: 'sleep_pattern',
      confidence: 78,
      dataPoints: ['bedtime_consistency', 'deep_sleep_percentage'],
      recommendations: [
        'Your bedtime varies by up to 2 hours. Try setting a consistent sleep schedule.',
        'Your deep sleep percentage is 18%, aim for 20-25% for better recovery.'
      ]
    });

    console.log('✓ Created AI interactions');

    // Get conversation history
    const conversationHistory = await aiService.getConversation(conversationId);
    if (conversationHistory.success && conversationHistory.data) {
      console.log(`✓ Retrieved conversation with ${conversationHistory.data.interactions.length} interactions`);
    }

  } catch (error) {
    console.error('AI interaction example failed:', error);
  }
}

/**
 * Example: Create user insights
 */
export async function exampleUserInsights() {
  try {
    console.log('\n=== User Insights ===');

    // Create different types of insights
    const insights = [
      {
        type: 'pattern' as const,
        title: 'Consistent Sleep Pattern Detected',
        description: 'You\'ve maintained a consistent bedtime for 5 days straight! This helps regulate your circadian rhythm.',
        priority: 'medium' as const,
        actionable: false,
        isRead: false
      },
      {
        type: 'recommendation' as const,
        title: 'Improve Deep Sleep',
        description: 'Your deep sleep percentage is below average. Try keeping your bedroom cooler (65-68°F) for better deep sleep.',
        priority: 'high' as const,
        actionable: true,
        actionText: 'View Sleep Tips',
        actionRoute: '/tips/deep-sleep',
        isRead: false
      },
      {
        type: 'achievement' as const,
        title: 'Weekly Goal Achieved!',
        description: 'Congratulations! You met your sleep duration goal 6 out of 7 nights this week.',
        priority: 'medium' as const,
        actionable: false,
        isRead: false
      }
    ];

    for (const insight of insights) {
      const result = await userService.createInsight('default_user', insight);
      if (result.success) {
        console.log(`✓ Created ${insight.type} insight`);
      }
    }

    // Get unread insights
    const unreadCount = await userService.getUnreadInsightsCount();
    console.log(`✓ Unread insights: ${unreadCount.data || 0}`);

  } catch (error) {
    console.error('Insights example failed:', error);
  }
}

/**
 * Example: Data export and analytics
 */
export async function exampleDataAnalytics() {
  try {
    console.log('\n=== Data Analytics ===');

    // Get quick summary
    const summary = await getQuickSleepSummary('default_user', 7);
    console.log('✓ Quick summary:', {
      sessions: summary.recentSessions.length,
      averageScore: summary.averageScore,
      unreadInsights: summary.unreadInsights,
      hasActiveGoal: !!summary.activeGoal
    });

    // Get sleep trends
    const trendsResult = await sleepService.getSleepTrends('default_user', 'week');
    if (trendsResult.success && trendsResult.data) {
      console.log('✓ Sleep trends:', {
        avgDuration: trendsResult.data.averageDuration,
        avgQuality: trendsResult.data.averageQuality,
        efficiency: trendsResult.data.efficiency,
        sessionCount: trendsResult.data.sessionCount
      });
    }

    // Export data
    const exportResult = await dataService.exportUserData('default_user', false);
    if (exportResult.success) {
      console.log('✓ Data export successful:', {
        sessions: exportResult.data!.sessions.length,
        goals: exportResult.data!.goals.length,
        insights: exportResult.data!.insights.length
      });
    }

    // Get CSV export
    const csvResult = await dataService.exportToCSV('default_user', 'sessions');
    if (csvResult.success) {
      console.log('✓ CSV export successful, length:', csvResult.data!.length);
    }

  } catch (error) {
    console.error('Analytics example failed:', error);
  }
}

/**
 * Example: Database maintenance
 */
export async function exampleMaintenance() {
  try {
    console.log('\n=== Database Maintenance ===');

    // Get database stats
    const stats = await dataService.getDatabaseStats();
    if (stats.success) {
      console.log('✓ Database stats:', stats.data);
    }

    // Validate data integrity
    const validation = await dataService.validateDataIntegrity();
    if (validation.success) {
      console.log('✓ Data integrity check:', validation.data);
    }

    // Perform maintenance
    const maintenance = await DatabaseManager.performMaintenance();
    console.log('✓ Maintenance completed:', maintenance);

  } catch (error) {
    console.error('Maintenance example failed:', error);
  }
}

/**
 * Generate sample sleep stages for a night
 */
function generateSampleSleepStages(bedtime: Date, wakeTime: Date) {
  const totalMinutes = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60);
  const stages: Array<{ stage: 'awake' | 'light' | 'deep' | 'rem'; startTime: Date; endTime: Date }> = [];
  
  let currentTime = new Date(bedtime);
  
  // Sleep latency (5-20 minutes awake)
  const sleepLatency = 5 + Math.random() * 15;
  const latencyEnd = new Date(currentTime.getTime() + sleepLatency * 60 * 1000);
  stages.push({
    stage: 'awake',
    startTime: new Date(currentTime),
    endTime: new Date(latencyEnd)
  });
  currentTime = latencyEnd;

  // Generate sleep cycles (each ~90 minutes)
  const remainingMinutes = totalMinutes - sleepLatency - 20; // Leave 20 min for wake at end
  const numCycles = Math.floor(remainingMinutes / 90);
  const cycleMinutes = remainingMinutes / numCycles;

  for (let cycle = 0; cycle < numCycles; cycle++) {
    const cycleStart = new Date(currentTime);
    const cycleEnd = new Date(cycleStart.getTime() + cycleMinutes * 60 * 1000);

    // Light sleep (40% of cycle)
    const lightDuration = cycleMinutes * 0.4;
    const lightEnd = new Date(currentTime.getTime() + lightDuration * 60 * 1000);
    stages.push({
      stage: 'light',
      startTime: new Date(currentTime),
      endTime: new Date(lightEnd)
    });
    currentTime = lightEnd;

    // Deep sleep (25% of cycle, more in early cycles)
    const deepPercentage = cycle < 2 ? 0.3 : 0.2;
    const deepDuration = cycleMinutes * deepPercentage;
    const deepEnd = new Date(currentTime.getTime() + deepDuration * 60 * 1000);
    stages.push({
      stage: 'deep',
      startTime: new Date(currentTime),
      endTime: new Date(deepEnd)
    });
    currentTime = deepEnd;

    // REM sleep (remaining time)
    if (currentTime < cycleEnd) {
      stages.push({
        stage: 'rem',
        startTime: new Date(currentTime),
        endTime: new Date(cycleEnd)
      });
      currentTime = cycleEnd;
    }

    // Brief awakening between cycles (except last)
    if (cycle < numCycles - 1) {
      const awakeEnd = new Date(currentTime.getTime() + 2 * 60 * 1000);
      stages.push({
        stage: 'awake',
        startTime: new Date(currentTime),
        endTime: new Date(awakeEnd)
      });
      currentTime = awakeEnd;
    }
  }

  // Final wake period
  if (currentTime < wakeTime) {
    stages.push({
      stage: 'awake',
      startTime: new Date(currentTime),
      endTime: new Date(wakeTime)
    });
  }

  return stages;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🌙 Lunar Sleep Database Service Examples\n');

  try {
    await exampleBasicUsage();
    await exampleCreateSleepSessions();
    await exampleAIInteractions();
    await exampleUserInsights();
    await exampleDataAnalytics();
    await exampleMaintenance();

    console.log('\n✅ All examples completed successfully!');
    console.log('\nNote: This is a demonstration file. In production, you would:');
    console.log('- Use proper error handling and user feedback');
    console.log('- Implement proper authentication and user management');
    console.log('- Add data validation and sanitization');
    console.log('- Use proper loading states in your UI');
    console.log('- Handle offline scenarios gracefully');

  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
  }
}

// Uncomment the line below to run examples (FOR DEVELOPMENT ONLY)
// runAllExamples();