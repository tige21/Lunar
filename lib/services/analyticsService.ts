/**
 * Analytics Service
 * Handles app analytics, user tracking, and performance monitoring
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface UserProperties {
  userId?: string;
  sleepGoal?: number;
  onboardingCompleted?: boolean;
  premiumUser?: boolean;
  deviceType?: string;
  appVersion?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private userProperties: UserProperties = {};

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    // In production, initialize analytics SDKs like:
    // - Firebase Analytics
    // - Mixpanel
    // - Amplitude
    // - Custom analytics
    
    console.log('Analytics service initialized (mock)');
    this.isInitialized = true;
  }

  /**
   * Track user events
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'mobile'
      },
      timestamp: new Date()
    };

    console.log('Analytics Event:', event);
    
    // In production, send to analytics providers:
    // this.sendToFirebase(event);
    // this.sendToMixpanel(event);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = { ...this.userProperties, ...properties };
    console.log('User properties updated:', this.userProperties);
  }

  /**
   * Track screen views
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties
    });
  }

  /**
   * Track sleep-specific events
   */
  trackSleepEvent(eventType: 'start_tracking' | 'stop_tracking' | 'view_analysis' | 'set_goal', data?: any): void {
    this.track(`sleep_${eventType}`, {
      ...data,
      category: 'sleep_tracking'
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: 'app_open' | 'feature_used' | 'share' | 'export_data', details?: any): void {
    this.track(`user_${action}`, {
      ...details,
      category: 'engagement'
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: 'load_time' | 'sync_time' | 'analysis_time', value: number, unit: 'ms' | 's' = 'ms'): void {
    this.track('performance_metric', {
      metric_name: metric,
      value,
      unit,
      category: 'performance'
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
      category: 'error'
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(type: 'onboarding_complete' | 'premium_upgrade' | 'goal_achieved', value?: number): void {
    this.track(`conversion_${type}`, {
      value,
      category: 'conversion'
    });
  }

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, any>): void {
    this.userProperties.userId = userId;
    this.setUserProperties(traits || {});
    
    console.log('User identified:', userId, traits);
  }

  /**
   * Reset user data (on logout)
   */
  reset(): void {
    this.userProperties = {};
    console.log('Analytics reset');
  }

  /**
   * Get current user properties
   */
  getUserProperties(): UserProperties {
    return { ...this.userProperties };
  }
}

export default AnalyticsService.getInstance();