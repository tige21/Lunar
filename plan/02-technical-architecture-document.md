# Lunar Sleep Analysis App - Technical Architecture Document

## Document Information
- **Document Version**: 1.0
- **Created**: September 8, 2025
- **Last Updated**: September 8, 2025
- **Status**: Draft

## 1. Architecture Overview

### 1.1 System Context
Lunar is a React Native mobile application built with Expo that integrates with Apple HealthKit for sleep data and provides AI-powered insights through external API services. The architecture prioritizes privacy, performance, and offline-first functionality.

### 1.2 Key Architectural Principles
- **Privacy-First**: All personal data stored locally, no cloud synchronization
- **Offline-First**: Core functionality works without internet connection
- **Modular Design**: Clean separation of concerns with reusable components
- **Performance Optimized**: Efficient data handling and UI rendering
- **Scalable**: Architecture supports future feature expansion

### 1.3 Technology Stack
```
Frontend Layer:
├── React Native 0.79.6
├── Expo SDK 53
├── TypeScript 5.8.3
├── Expo Router (file-based routing)
└── gluestack-ui (UI components)

Data Layer:
├── Expo SQLite (local database)
├── Expo SecureStore (encrypted storage)
├── react-native-health (HealthKit integration)
└── AsyncStorage (app preferences)

External Services:
├── OpenAI GPT-4 API (AI recommendations)
├── Apple HealthKit (sleep data source)
└── Expo Push Notifications (optional)

Development Tools:
├── ESLint (code linting)
├── Prettier (code formatting)
├── Jest (unit testing)
└── Detox (E2E testing)
```

## 2. System Architecture

### 2.1 High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    Lunar App                            │
├─────────────────────────────────────────────────────────┤
│                 Presentation Layer                      │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │   Dashboard  │   Analytics  │   AI Chat        │    │
│  │   Component  │   Component  │   Component      │    │
│  └──────────────┴──────────────┴──────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                 Business Logic Layer                    │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │ Sleep Data   │ AI Service   │ Analytics        │    │
│  │ Manager      │ Manager      │ Manager          │    │
│  └──────────────┴──────────────┴──────────────────┘    │
├─────────────────────────────────────────────────────────┤
│                 Data Access Layer                       │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │ SQLite       │ SecureStore  │ HealthKit        │    │
│  │ Repository   │ Repository   │ Repository       │    │
│  └──────────────┴──────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Local SQLite  │  │ Apple HealthKit │  │ OpenAI API      │
│   Database      │  │                 │  │ (External)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 Presentation Layer Components
```typescript
// Component structure
src/
├── app/                          # Expo Router pages
│   ├── (tabs)/                  # Tab-based screens
│   │   ├── index.tsx           # Dashboard
│   │   ├── analytics.tsx       # Analytics screen
│   │   ├── chat.tsx           # AI Chat screen
│   │   ├── improvement.tsx     # Improvement plan
│   │   └── settings.tsx        # Settings screen
│   ├── onboarding/             # Onboarding flow
│   │   ├── welcome.tsx
│   │   ├── permissions.tsx
│   │   └── goals.tsx
│   └── _layout.tsx             # Root layout
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chart.tsx
│   │   └── Input.tsx
│   ├── sleep/                  # Sleep-specific components
│   │   ├── SleepScore.tsx
│   │   ├── SleepPhases.tsx
│   │   └── SleepTrends.tsx
│   └── common/                 # Common components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
```

#### 2.2.2 Business Logic Layer
```typescript
// Services and managers
src/
├── services/                   # Business logic services
│   ├── SleepDataService.ts    # Sleep data processing
│   ├── AIService.ts           # AI recommendations
│   ├── AnalyticsService.ts    # Analytics calculations
│   ├── NotificationService.ts # Push notifications
│   └── ExportService.ts       # Data export
├── managers/                   # State management
│   ├── SleepDataManager.ts    # Sleep data state
│   ├── UserPreferencesManager.ts
│   └── AIConversationManager.ts
├── hooks/                      # Custom React hooks
│   ├── useSleepData.ts
│   ├── useAIChat.ts
│   ├── useAnalytics.ts
│   └── useTheme.ts
```

#### 2.2.3 Data Access Layer
```typescript
// Data repositories and models
src/
├── repositories/               # Data access layer
│   ├── SleepDataRepository.ts
│   ├── UserRepository.ts
│   ├── ConversationRepository.ts
│   └── SettingsRepository.ts
├── models/                     # Data models
│   ├── SleepData.ts
│   ├── User.ts
│   ├── Conversation.ts
│   └── Settings.ts
├── database/                   # Database management
│   ├── SQLiteManager.ts
│   ├── migrations/
│   └── seeds/
```

## 3. Data Architecture

### 3.1 Database Schema
```sql
-- SQLite Database Schema

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    sleep_goal_hours REAL DEFAULT 8.0,
    bedtime_goal TEXT DEFAULT '22:00',
    wake_time_goal TEXT DEFAULT '06:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sleep sessions table
CREATE TABLE sleep_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_duration_minutes INTEGER NOT NULL,
    sleep_efficiency REAL,
    time_in_bed_minutes INTEGER,
    time_asleep_minutes INTEGER,
    sleep_score INTEGER,
    source TEXT DEFAULT 'apple_health',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sleep phases table
CREATE TABLE sleep_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sleep_sessions(id),
    phase_type TEXT NOT NULL CHECK (phase_type IN ('awake', 'rem', 'core', 'deep')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sleep_sessions(id)
);

-- Heart rate data table
CREATE TABLE heart_rate_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sleep_sessions(id),
    timestamp TIMESTAMP NOT NULL,
    heart_rate INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sleep_sessions(id)
);

-- AI conversations table
CREATE TABLE ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_data TEXT, -- JSON string with sleep data context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Improvement plans table
CREATE TABLE improvement_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    target_metric TEXT NOT NULL,
    target_value REAL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily tasks table
CREATE TABLE daily_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER REFERENCES improvement_plans(id),
    title TEXT NOT NULL,
    description TEXT,
    task_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES improvement_plans(id)
);

-- App settings table
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, setting_key)
);

-- Indexes for performance
CREATE INDEX idx_sleep_sessions_user_id ON sleep_sessions(user_id);
CREATE INDEX idx_sleep_sessions_start_time ON sleep_sessions(start_time);
CREATE INDEX idx_sleep_phases_session_id ON sleep_phases(session_id);
CREATE INDEX idx_heart_rate_session_id ON heart_rate_data(session_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_daily_tasks_plan_date ON daily_tasks(plan_id, task_date);
```

### 3.2 Data Models
```typescript
// TypeScript data models

export interface User {
  id: number;
  firstName: string;
  sleepGoalHours: number;
  bedtimeGoal: string; // HH:mm format
  wakeTimeGoal: string; // HH:mm format
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepSession {
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  totalDurationMinutes: number;
  sleepEfficiency?: number;
  timeInBedMinutes: number;
  timeAsleepMinutes: number;
  sleepScore?: number;
  source: 'apple_health' | 'manual' | 'other';
  phases: SleepPhase[];
  heartRateData?: HeartRateData[];
  createdAt: Date;
}

export interface SleepPhase {
  id: number;
  sessionId: number;
  phaseType: 'awake' | 'rem' | 'core' | 'deep';
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface HeartRateData {
  id: number;
  sessionId: number;
  timestamp: Date;
  heartRate: number;
}

export interface AIConversation {
  id: number;
  userId: number;
  userMessage: string;
  aiResponse: string;
  contextData?: SleepContextData;
  timestamp: Date;
}

export interface SleepContextData {
  recentSessions: SleepSession[];
  currentGoals: User;
  trends: SleepTrends;
}

export interface ImprovementPlan {
  id: number;
  userId: number;
  title: string;
  description?: string;
  targetMetric: string;
  targetValue: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused';
  tasks: DailyTask[];
  createdAt: Date;
}

export interface DailyTask {
  id: number;
  planId: number;
  title: string;
  description?: string;
  taskDate: Date;
  completed: boolean;
  completedAt?: Date;
}
```

## 4. Security Architecture

### 4.1 Data Security
```typescript
// Security implementation approach

// 1. Local Data Encryption
class SecureDataManager {
  private async encryptSensitiveData(data: any): Promise<string> {
    // Use Expo SecureStore for sensitive data
    return await SecureStore.setItemAsync('userData', JSON.stringify(data));
  }
  
  private async decryptSensitiveData(key: string): Promise<any> {
    const encryptedData = await SecureStore.getItemAsync(key);
    return encryptedData ? JSON.parse(encryptedData) : null;
  }
}

// 2. Biometric Authentication
class AuthenticationManager {
  async authenticateUser(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your sleep data',
        fallbackLabel: 'Use passcode',
      });
      return result.success;
    }
    return true; // Fallback to no auth if not available
  }
}

// 3. API Security for AI Service
class APISecurityManager {
  private sanitizeUserInput(input: string): string {
    // Remove PII and sanitize input before sending to AI API
    return input.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]'); // SSN
  }
  
  private anonymizeContextData(data: SleepContextData): SleepContextData {
    // Remove identifying information while preserving sleep patterns
    return {
      ...data,
      recentSessions: data.recentSessions.map(session => ({
        ...session,
        userId: 0, // Anonymize user ID
      }))
    };
  }
}
```

### 4.2 Privacy Controls
- All personal data stored locally on device
- No cloud synchronization or backup
- Biometric authentication for app access
- Data export in user-controlled formats
- Secure deletion of user data on uninstall

## 5. Performance Architecture

### 5.1 Data Loading Strategy
```typescript
// Performance optimization strategies

class DataLoadingManager {
  // 1. Lazy Loading for Historical Data
  async loadSleepData(timeRange: TimeRange, limit: number = 50): Promise<SleepSession[]> {
    return await this.sleepRepository.getSessions({
      startDate: timeRange.start,
      endDate: timeRange.end,
      limit,
      offset: 0
    });
  }
  
  // 2. Memoized Calculations
  @memoize
  calculateSleepScore(session: SleepSession): number {
    // Expensive calculation cached
    return this.sleepScoreAlgorithm.calculate(session);
  }
  
  // 3. Background Data Sync
  async syncHealthData(): Promise<void> {
    // Sync in background to avoid blocking UI
    BackgroundTask.start(() => {
      this.healthKitManager.syncRecentData();
    });
  }
}

// Chart rendering optimization
class ChartPerformanceManager {
  // Data aggregation for large datasets
  aggregateDataForChart(data: SleepSession[], granularity: 'daily' | 'weekly' | 'monthly') {
    switch (granularity) {
      case 'daily':
        return data; // Show all data points
      case 'weekly':
        return this.aggregateByWeek(data);
      case 'monthly':
        return this.aggregateByMonth(data);
    }
  }
  
  // Virtualized list rendering
  renderVirtualizedList(data: any[], renderItem: Function) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        windowSize={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    );
  }
}
```

### 5.2 Memory Management
- Implement proper component cleanup
- Use React.memo for expensive renders
- Optimize image loading and caching
- Monitor memory usage in development
- Implement data pagination for large datasets

## 6. Integration Architecture

### 6.1 Apple HealthKit Integration
```typescript
class HealthKitManager {
  private readonly SLEEP_CATEGORY = HKCategoryTypeIdentifier.sleepAnalysis;
  private readonly HEART_RATE_TYPE = HKQuantityTypeIdentifier.heartRate;
  
  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = {
        permissions: {
          read: [
            this.SLEEP_CATEGORY,
            this.HEART_RATE_TYPE,
            HKQuantityTypeIdentifier.timeInBed,
          ],
          write: [] // Read-only access
        }
      };
      
      await AppleHealthKit.initHealthKit(permissions);
      return true;
    } catch (error) {
      console.error('HealthKit permission error:', error);
      return false;
    }
  }
  
  async getSleepSamples(startDate: Date, endDate: Date): Promise<SleepSession[]> {
    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: true,
      };
      
      AppleHealthKit.getSleepSamples(options, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        const sessions = this.processSleepSamples(results);
        resolve(sessions);
      });
    });
  }
  
  private processSleepSamples(samples: any[]): SleepSession[] {
    // Group samples by sleep session
    // Calculate sleep phases and metrics
    // Return processed sleep sessions
    return this.groupSamplesBySessions(samples);
  }
}
```

### 6.2 AI Service Integration
```typescript
class AIServiceManager {
  private readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  private readonly MAX_TOKENS = 500;
  private readonly TIMEOUT = 10000; // 10 seconds
  
  async getPersonalizedRecommendation(
    userMessage: string,
    sleepContext: SleepContextData
  ): Promise<string> {
    try {
      const sanitizedMessage = this.sanitizeInput(userMessage);
      const anonymizedContext = this.anonymizeContext(sleepContext);
      
      const prompt = this.buildPrompt(sanitizedMessage, anonymizedContext);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a sleep wellness coach providing personalized advice based on sleep data.',
            },
            {
              role: 'user',
              content: prompt,
            }
          ],
          max_tokens: this.MAX_TOKENS,
          temperature: 0.7,
        }),
        timeout: this.TIMEOUT,
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('AI Service error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }
  
  private buildPrompt(message: string, context: SleepContextData): string {
    return `
      User Question: ${message}
      
      Sleep Context:
      - Average sleep duration: ${context.trends.averageDuration} hours
      - Sleep efficiency: ${context.trends.averageEfficiency}%
      - Recent sleep score: ${context.recentSessions[0]?.sleepScore}/100
      
      Provide a helpful, personalized recommendation in 2-3 sentences.
    `;
  }
  
  private getFallbackResponse(message: string): string {
    // Offline fallback responses for common questions
    const fallbacks = {
      'improve sleep': 'Try maintaining a consistent bedtime routine and avoiding screens 1 hour before bed.',
      'sleep score': 'Sleep scores are calculated based on duration, efficiency, and sleep phases. Aim for 7-9 hours of quality sleep.',
      'default': 'I\'m currently unable to provide personalized recommendations. Please check your internet connection and try again.',
    };
    
    const key = Object.keys(fallbacks).find(k => 
      message.toLowerCase().includes(k)
    ) || 'default';
    
    return fallbacks[key];
  }
}
```

## 7. Error Handling & Resilience

### 7.1 Error Handling Strategy
```typescript
// Global error handling
class ErrorHandlingManager {
  static handleError(error: Error, context: string): void {
    // Log error for debugging
    console.error(`Error in ${context}:`, error);
    
    // Report to crash analytics (privacy-compliant)
    this.reportError(error, context);
    
    // Show user-friendly message
    this.showUserError(error, context);
  }
  
  private static reportError(error: Error, context: string): void {
    // Only report non-PII error information
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      appVersion: Constants.manifest?.version,
    };
    
    // Send to privacy-compliant error reporting service
  }
  
  private static showUserError(error: Error, context: string): void {
    const userMessage = this.getUserFriendlyMessage(error, context);
    
    // Show toast or modal with recovery options
    Alert.alert('Something went wrong', userMessage, [
      { text: 'Try Again', onPress: () => this.retryLastAction() },
      { text: 'OK' }
    ]);
  }
}

// Network error handling
class NetworkErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await this.delay(delay * attempt);
      }
    }
    throw new Error('Max retries exceeded');
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 7.2 Data Validation
```typescript
// Input validation schemas
export const sleepSessionSchema = {
  startTime: (value: any) => value instanceof Date && !isNaN(value.getTime()),
  endTime: (value: any) => value instanceof Date && !isNaN(value.getTime()),
  totalDurationMinutes: (value: any) => typeof value === 'number' && value > 0 && value <= 1440,
  sleepEfficiency: (value: any) => value === null || (typeof value === 'number' && value >= 0 && value <= 100),
};

export const validateSleepSession = (data: any): SleepSession | null => {
  try {
    // Validate required fields
    if (!sleepSessionSchema.startTime(data.startTime)) {
      throw new Error('Invalid start time');
    }
    if (!sleepSessionSchema.endTime(data.endTime)) {
      throw new Error('Invalid end time');
    }
    if (!sleepSessionSchema.totalDurationMinutes(data.totalDurationMinutes)) {
      throw new Error('Invalid duration');
    }
    
    return data as SleepSession;
  } catch (error) {
    console.error('Sleep session validation error:', error);
    return null;
  }
};
```

## 8. Testing Architecture

### 8.1 Testing Strategy
```typescript
// Unit testing setup
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Integration testing
describe('SleepDataManager', () => {
  let sleepDataManager: SleepDataManager;
  let mockHealthKit: jest.Mocked<HealthKitManager>;
  
  beforeEach(() => {
    mockHealthKit = createMockHealthKit();
    sleepDataManager = new SleepDataManager(mockHealthKit);
  });
  
  it('should process health kit data correctly', async () => {
    const mockData = createMockSleepData();
    mockHealthKit.getSleepSamples.mockResolvedValue(mockData);
    
    const result = await sleepDataManager.syncSleepData();
    
    expect(result).toHaveLength(mockData.length);
    expect(result[0]).toHaveProperty('sleepScore');
  });
});
```

### 8.2 Performance Testing
```typescript
// Performance monitoring
class PerformanceMonitor {
  static measureRenderTime(componentName: string) {
    return (Component: React.ComponentType) => {
      return React.memo((props) => {
        const startTime = performance.now();
        
        useEffect(() => {
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          if (renderTime > 16) { // Target 60fps
            console.warn(`${componentName} render took ${renderTime}ms`);
          }
        });
        
        return <Component {...props} />;
      });
    };
  }
  
  static measureDataOperation(operationName: string) {
    return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;
      
      descriptor.value = async function(...args: any[]) {
        const startTime = performance.now();
        const result = await method.apply(this, args);
        const endTime = performance.now();
        
        console.log(`${operationName} took ${endTime - startTime}ms`);
        return result;
      };
      
      return descriptor;
    };
  }
}
```

## 9. Deployment Architecture

### 9.1 Build Configuration
```json
// app.json - Production configuration
{
  "expo": {
    "name": "Lunar",
    "slug": "lunar-sleep-analysis",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lunar.sleep",
      "buildNumber": "1",
      "infoPlist": {
        "NSHealthShareUsageDescription": "This app reads your sleep data from Apple Health to provide personalized sleep insights and recommendations.",
        "NSHealthUpdateUsageDescription": "This app may write sleep-related data to Apple Health (optional)."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.lunar.sleep",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "lunar-sleep-project-id"
      }
    },
    "plugins": [
      "expo-router",
      "@react-native-async-storage/async-storage",
      "react-native-health"
    ]
  }
}
```

### 9.2 Environment Configuration
```typescript
// config/environment.ts
interface EnvironmentConfig {
  API_BASE_URL: string;
  OPENAI_API_KEY: string;
  SENTRY_DSN?: string;
  ANALYTICS_ENABLED: boolean;
  DEBUG_MODE: boolean;
}

const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: 'http://localhost:3000',
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  ANALYTICS_ENABLED: false,
  DEBUG_MODE: true,
};

const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://api.lunar-sleep.com',
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  ANALYTICS_ENABLED: true,
  DEBUG_MODE: false,
};

export const config = __DEV__ ? developmentConfig : productionConfig;
```

## 10. Monitoring & Analytics

### 10.1 Application Monitoring
```typescript
// Analytics service (privacy-compliant)
class AnalyticsService {
  private isEnabled: boolean = config.ANALYTICS_ENABLED;
  
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;
    
    const sanitizedProperties = this.sanitizeProperties(properties);
    
    // Send to privacy-compliant analytics service
    this.sendAnalyticsEvent(eventName, sanitizedProperties);
  }
  
  trackScreenView(screenName: string): void {
    this.trackEvent('screen_view', { screen_name: screenName });
  }
  
  trackUserAction(action: string, context?: string): void {
    this.trackEvent('user_action', { action, context });
  }
  
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};
    
    // Remove any PII from analytics properties
    const sanitized = { ...properties };
    delete sanitized.userId;
    delete sanitized.email;
    delete sanitized.personalData;
    
    return sanitized;
  }
}

// Performance monitoring
class PerformanceAnalytics {
  static trackAppLaunch(): void {
    const launchTime = Date.now();
    
    // Measure time to interactive
    setTimeout(() => {
      const timeToInteractive = Date.now() - launchTime;
      analytics.trackEvent('app_performance', {
        metric: 'time_to_interactive',
        value: timeToInteractive,
      });
    }, 100);
  }
  
  static trackDataSyncTime(syncType: string, duration: number): void {
    analytics.trackEvent('data_sync_performance', {
      sync_type: syncType,
      duration_ms: duration,
    });
  }
}
```

## 11. Scalability Considerations

### 11.1 Future Architecture Enhancements
- **Cloud Sync Option**: Optional encrypted cloud backup
- **Multi-device Support**: Sync across user's devices
- **Plugin Architecture**: Third-party integrations
- **Advanced AI**: On-device ML models for privacy
- **API Gateway**: Rate limiting and monitoring for external services

### 11.2 Performance Scaling
- **Data Archiving**: Move old data to compressed storage
- **Incremental Sync**: Only sync changed data
- **Background Processing**: Heavy calculations in background threads
- **Caching Strategy**: Multi-level caching for frequently accessed data

---

**Document Status**: Ready for Technical Review
**Next Review Date**: September 15, 2025
**Document Owner**: Technical Architecture Team