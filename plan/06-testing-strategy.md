# Lunar Sleep Analysis App - Testing Strategy

## Document Information
- **Document Version**: 1.0
- **Created**: September 8, 2025
- **Last Updated**: September 8, 2025
- **Status**: Draft

## 1. Testing Strategy Overview

### 1.1 Testing Philosophy
The Lunar app testing strategy is built on the principle of "Quality by Design," ensuring that quality is embedded throughout the development process rather than bolted on at the end. Our approach emphasizes early testing, continuous validation, and comprehensive coverage across all user scenarios.

### 1.2 Testing Objectives
- **Reliability**: Ensure app functions consistently across all supported iOS devices and versions
- **Performance**: Validate app meets performance targets for startup, data processing, and UI responsiveness  
- **Security**: Verify privacy controls and data protection mechanisms work as intended
- **Usability**: Confirm user experience meets design goals and accessibility standards
- **Data Accuracy**: Validate sleep data processing and AI recommendations are accurate and helpful

### 1.3 Quality Gates
- **Unit Test Coverage**: Minimum 90% code coverage for all business logic
- **Integration Test Coverage**: 100% coverage of critical user workflows
- **Performance Benchmarks**: All performance targets met on target devices
- **Accessibility Compliance**: WCAG 2.1 AA standards verified
- **Security Validation**: All privacy controls and data handling verified

### 1.4 Testing Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Code Coverage | >90% | Automated coverage reports |
| Defect Escape Rate | <2% | Post-release bug reports |
| Test Automation | >80% | Automated vs manual test ratio |
| Performance SLA | 100% | All benchmarks met |
| User Acceptance | >4.5/5 | Beta testing surveys |

## 2. Test Pyramid Strategy

### 2.1 Test Level Distribution
```
               E2E Tests (10%)
          ─────────────────────────
        Integration Tests (20%)
      ─────────────────────────────
     Unit Tests (70%)
   ─────────────────────────────────
```

**Rationale**: Heavy emphasis on unit tests for fast feedback, supported by integration tests for component interaction verification, topped with critical E2E tests for user journey validation.

### 2.2 Testing Types Overview

#### 2.2.1 Unit Tests (70% of testing effort)
- **Scope**: Individual functions, components, and utilities
- **Tools**: Jest, React Native Testing Library
- **Execution**: Every code commit via CI/CD
- **Coverage Target**: 95% for business logic, 85% overall

#### 2.2.2 Integration Tests (20% of testing effort)
- **Scope**: Component interactions, API integrations, data flow
- **Tools**: Jest, React Native Testing Library, Mock services
- **Execution**: Daily automated runs, pre-release validation
- **Coverage Target**: 100% of critical integration points

#### 2.2.3 End-to-End Tests (10% of testing effort)
- **Scope**: Complete user workflows, cross-system validation
- **Tools**: Detox, iOS Simulator/Physical devices
- **Execution**: Weekly automated runs, release validation
- **Coverage Target**: 100% of core user journeys

## 3. Unit Testing Strategy

### 3.1 Unit Test Framework Setup
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/assets/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 3.2 Component Testing Standards

#### 3.2.1 React Component Tests
```typescript
// Example: SleepScore.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SleepScore } from '@/components/SleepScore';

describe('SleepScore Component', () => {
  const mockProps = {
    score: 85,
    maxScore: 100,
    date: new Date('2025-01-15'),
  };

  it('renders sleep score correctly', () => {
    render(<SleepScore {...mockProps} />);
    
    expect(screen.getByText('85')).toBeTruthy();
    expect(screen.getByText('Sleep Score')).toBeTruthy();
  });

  it('displays correct score percentage', () => {
    render(<SleepScore {...mockProps} />);
    
    const progressCircle = screen.getByTestId('score-progress-circle');
    expect(progressCircle.props.progress).toBe(0.85);
  });

  it('handles missing score gracefully', () => {
    render(<SleepScore {...mockProps} score={null} />);
    
    expect(screen.getByText('--')).toBeTruthy();
    expect(screen.getByText('No data available')).toBeTruthy();
  });

  it('applies correct accessibility labels', () => {
    render(<SleepScore {...mockProps} />);
    
    const scoreElement = screen.getByLabelText('Sleep score: 85 out of 100');
    expect(scoreElement).toBeTruthy();
  });
});
```

#### 3.2.2 Business Logic Tests
```typescript
// Example: SleepDataService.test.ts
import { SleepDataService } from '@/services/SleepDataService';
import { mockSleepSessions } from '@/__tests__/fixtures/sleepData';

describe('SleepDataService', () => {
  let service: SleepDataService;

  beforeEach(() => {
    service = new SleepDataService();
  });

  describe('calculateSleepScore', () => {
    it('calculates correct score for good sleep', () => {
      const session = mockSleepSessions.goodSleep;
      const score = service.calculateSleepScore(session);
      
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles insufficient sleep data', () => {
      const session = mockSleepSessions.insufficientData;
      const score = service.calculateSleepScore(session);
      
      expect(score).toBeNull();
    });

    it('accounts for sleep efficiency in scoring', () => {
      const highEfficiency = mockSleepSessions.highEfficiency;
      const lowEfficiency = mockSleepSessions.lowEfficiency;
      
      const highScore = service.calculateSleepScore(highEfficiency);
      const lowScore = service.calculateSleepScore(lowEfficiency);
      
      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('processSleepTrends', () => {
    it('identifies improving sleep patterns', () => {
      const sessions = mockSleepSessions.improvingPattern;
      const trends = service.processSleepTrends(sessions);
      
      expect(trends.direction).toBe('improving');
      expect(trends.confidence).toBeGreaterThan(0.7);
    });

    it('detects sleep pattern anomalies', () => {
      const sessions = mockSleepSessions.withAnomalies;
      const trends = service.processSleepTrends(sessions);
      
      expect(trends.anomalies).toHaveLength(2);
      expect(trends.anomalies[0].type).toBe('duration_outlier');
    });
  });
});
```

### 3.3 Utility and Hook Testing

#### 3.3.1 Custom Hook Tests
```typescript
// Example: useSleepData.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useSleepData } from '@/hooks/useSleepData';
import { mockHealthKitService } from '@/__mocks__/HealthKitService';

jest.mock('@/services/HealthKitService');

describe('useSleepData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads sleep data on mount', async () => {
    mockHealthKitService.getSleepData.mockResolvedValue(mockSleepSessions);
    
    const { result, waitForNextUpdate } = renderHook(() => useSleepData());
    
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockSleepSessions);
    expect(mockHealthKitService.getSleepData).toHaveBeenCalledTimes(1);
  });

  it('handles data loading errors', async () => {
    const error = new Error('HealthKit permission denied');
    mockHealthKitService.getSleepData.mockRejectedValue(error);
    
    const { result, waitForNextUpdate } = renderHook(() => useSleepData());
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeNull();
  });

  it('refreshes data when requested', async () => {
    mockHealthKitService.getSleepData.mockResolvedValue(mockSleepSessions);
    
    const { result, waitForNextUpdate } = renderHook(() => useSleepData());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(mockHealthKitService.getSleepData).toHaveBeenCalledTimes(2);
  });
});
```

### 3.4 Test Data Management

#### 3.4.1 Mock Data Structure
```typescript
// __tests__/fixtures/sleepData.ts
export const mockSleepSessions = {
  goodSleep: {
    id: '1',
    startTime: new Date('2025-01-15T23:00:00Z'),
    endTime: new Date('2025-01-16T07:00:00Z'),
    totalDurationMinutes: 480,
    sleepEfficiency: 92,
    phases: [
      {
        phaseType: 'core',
        startTime: new Date('2025-01-15T23:15:00Z'),
        endTime: new Date('2025-01-16T02:00:00Z'),
        durationMinutes: 165,
      },
      // ... more phases
    ],
  },
  
  insufficientData: {
    id: '2',
    startTime: new Date('2025-01-15T23:00:00Z'),
    endTime: new Date('2025-01-16T07:00:00Z'),
    totalDurationMinutes: 240, // Only 4 hours
    sleepEfficiency: null,
    phases: [],
  },
  
  // More test scenarios...
};
```

## 4. Integration Testing Strategy

### 4.1 API Integration Tests

#### 4.1.1 HealthKit Integration Tests
```typescript
// __tests__/integration/HealthKitIntegration.test.ts
import { HealthKitService } from '@/services/HealthKitService';
import { SleepDataRepository } from '@/repositories/SleepDataRepository';

describe('HealthKit Integration', () => {
  let healthKitService: HealthKitService;
  let sleepDataRepository: SleepDataRepository;

  beforeEach(() => {
    healthKitService = new HealthKitService();
    sleepDataRepository = new SleepDataRepository();
  });

  it('syncs sleep data from HealthKit to local database', async () => {
    // Mock HealthKit permissions granted
    jest.spyOn(healthKitService, 'hasPermissions')
      .mockResolvedValue(true);
    
    // Mock HealthKit data return
    jest.spyOn(healthKitService, 'getSleepSamples')
      .mockResolvedValue(mockHealthKitSamples);
    
    // Execute sync
    await healthKitService.syncSleepData();
    
    // Verify data stored in local database
    const storedSessions = await sleepDataRepository.getAllSessions();
    expect(storedSessions).toHaveLength(mockHealthKitSamples.length);
    
    // Verify data transformation
    expect(storedSessions[0].totalDurationMinutes).toBe(480);
    expect(storedSessions[0].phases).toHaveLength(4);
  });

  it('handles HealthKit permission denial gracefully', async () => {
    jest.spyOn(healthKitService, 'hasPermissions')
      .mockResolvedValue(false);
    
    const result = await healthKitService.syncSleepData();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('permissions');
    
    // Verify no data stored when permissions denied
    const storedSessions = await sleepDataRepository.getAllSessions();
    expect(storedSessions).toHaveLength(0);
  });

  it('handles data conflicts from multiple sources', async () => {
    // Setup conflicting data from iPhone and Apple Watch
    const conflictingData = mockConflictingHealthKitData;
    
    jest.spyOn(healthKitService, 'getSleepSamples')
      .mockResolvedValue(conflictingData);
    
    await healthKitService.syncSleepData();
    
    const storedSessions = await sleepDataRepository.getAllSessions();
    
    // Verify conflict resolution (Apple Watch data preferred)
    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0].source).toBe('apple_watch');
  });
});
```

#### 4.1.2 AI Service Integration Tests
```typescript
// __tests__/integration/AIServiceIntegration.test.ts
import { AIService } from '@/services/AIService';
import { SleepDataService } from '@/services/SleepDataService';

describe('AI Service Integration', () => {
  let aiService: AIService;
  let sleepDataService: SleepDataService;

  beforeEach(() => {
    aiService = new AIService();
    sleepDataService = new SleepDataService();
  });

  it('generates personalized recommendations based on sleep data', async () => {
    const sleepData = mockSleepDataForRecommendation;
    const userQuery = "How can I improve my deep sleep?";
    
    const response = await aiService.getRecommendation(userQuery, sleepData);
    
    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(50);
    expect(response.toLowerCase()).toContain('deep sleep');
    
    // Verify context was properly included
    expect(aiService.lastRequestContext).toMatchObject({
      averageSleepDuration: expect.any(Number),
      deepSleepPercentage: expect.any(Number),
    });
  });

  it('handles API failures with fallback responses', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));
    
    const sleepData = mockSleepDataForRecommendation;
    const userQuery = "Why am I tired?";
    
    const response = await aiService.getRecommendation(userQuery, sleepData);
    
    // Verify fallback response provided
    expect(response).toBeDefined();
    expect(response).toContain('currently unable');
    
    // Verify error was logged
    expect(aiService.lastError).toBeInstanceOf(Error);
  });

  it('sanitizes user input before API call', async () => {
    const sensitiveQuery = "My SSN is 123-45-6789, how's my sleep?";
    const sleepData = mockSleepDataForRecommendation;
    
    const fetchSpy = jest.spyOn(global, 'fetch')
      .mockResolvedValue(createMockResponse(mockAIResponse));
    
    await aiService.getRecommendation(sensitiveQuery, sleepData);
    
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    const sentMessage = requestBody.messages.find(m => m.role === 'user').content;
    
    // Verify PII was removed
    expect(sentMessage).not.toContain('123-45-6789');
    expect(sentMessage).toContain('[REDACTED]');
  });
});
```

### 4.2 Data Flow Integration Tests

#### 4.2.1 Complete Data Pipeline Tests
```typescript
// __tests__/integration/DataPipeline.test.ts
describe('Sleep Data Pipeline Integration', () => {
  it('processes complete sleep data flow from HealthKit to UI', async () => {
    // 1. Mock HealthKit data retrieval
    const healthKitService = new HealthKitService();
    jest.spyOn(healthKitService, 'getSleepSamples')
      .mockResolvedValue(mockRawHealthKitData);
    
    // 2. Sync data to database
    await healthKitService.syncSleepData();
    
    // 3. Process data through business logic
    const sleepDataService = new SleepDataService();
    const processedData = await sleepDataService.getProcessedSleepData();
    
    // 4. Verify data transformations
    expect(processedData.sleepScore).toBeDefined();
    expect(processedData.trends).toBeDefined();
    expect(processedData.phases).toHaveLength(4);
    
    // 5. Test UI component integration
    const { getByTestId } = render(
      <Dashboard sleepData={processedData} />
    );
    
    expect(getByTestId('sleep-score-display')).toBeTruthy();
    expect(getByTestId('sleep-phases-chart')).toBeTruthy();
  });

  it('handles data inconsistencies throughout pipeline', async () => {
    // Mock inconsistent HealthKit data
    const inconsistentData = mockInconsistentHealthKitData;
    
    const healthKitService = new HealthKitService();
    jest.spyOn(healthKitService, 'getSleepSamples')
      .mockResolvedValue(inconsistentData);
    
    await healthKitService.syncSleepData();
    
    const sleepDataService = new SleepDataService();
    const processedData = await sleepDataService.getProcessedSleepData();
    
    // Verify data validation and correction
    expect(processedData.dataQuality.issues).toContain('time_overlap');
    expect(processedData.dataQuality.confidence).toBeLessThan(0.8);
    expect(processedData.sleepScore).toBeNull(); // Invalid data = no score
  });
});
```

## 5. End-to-End Testing Strategy

### 5.1 E2E Test Framework Setup

#### 5.1.1 Detox Configuration
```javascript
// .detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator', 
      app: 'ios.release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Pro',
        os: 'iOS 16.4',
      },
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Lunar.app',
      build: 'xcodebuild -workspace ios/Lunar.xcworkspace -scheme Lunar -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
};
```

### 5.2 Critical User Journey Tests

#### 5.2.1 Onboarding Flow Test
```typescript
// e2e/onboarding.e2e.ts
describe('Onboarding Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('completes full onboarding flow successfully', async () => {
    // Welcome screen
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await expect(element(by.text('Welcome to Lunar'))).toBeVisible();
    await element(by.id('get-started-button')).tap();

    // Health permissions screen
    await expect(element(by.id('permissions-screen'))).toBeVisible();
    await expect(element(by.text('Connect with Apple Health'))).toBeVisible();
    
    // Mock HealthKit permission grant
    await element(by.id('connect-health-button')).tap();
    await mockHealthKitPermission(true);
    
    // Goals setup screen
    await expect(element(by.id('goals-screen'))).toBeVisible();
    
    // Set sleep goal to 8 hours
    await element(by.id('sleep-duration-picker')).tap();
    await element(by.text('8 hours')).tap();
    
    // Set bedtime to 11 PM
    await element(by.id('bedtime-picker')).tap();
    await element(by.text('11:00 PM')).tap();
    
    // Set wake time to 7 AM  
    await element(by.id('wake-time-picker')).tap();
    await element(by.text('7:00 AM')).tap();
    
    // Complete setup
    await element(by.id('complete-setup-button')).tap();
    
    // Verify navigation to dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.id('sleep-score-circle'))).toBeVisible();
  });

  it('handles HealthKit permission denial gracefully', async () => {
    await element(by.id('get-started-button')).tap();
    await element(by.id('connect-health-button')).tap();
    
    // Mock permission denial
    await mockHealthKitPermission(false);
    
    // Verify fallback options shown
    await expect(element(by.text('Manual Entry Available'))).toBeVisible();
    await expect(element(by.id('manual-entry-option'))).toBeVisible();
    
    await element(by.id('continue-without-health')).tap();
    
    // Should still reach goals screen
    await expect(element(by.id('goals-screen'))).toBeVisible();
  });

  it('validates goal inputs properly', async () => {
    // Navigate to goals screen
    await element(by.id('get-started-button')).tap();
    await element(by.id('connect-health-button')).tap();
    await mockHealthKitPermission(true);
    
    // Try to set impossible sleep schedule
    await element(by.id('bedtime-picker')).tap();
    await element(by.text('11:00 PM')).tap();
    
    await element(by.id('wake-time-picker')).tap();
    await element(by.text('5:00 AM')).tap(); // Only 6 hours sleep
    
    await element(by.id('complete-setup-button')).tap();
    
    // Should show validation error
    await expect(element(by.text('Recommended minimum 7 hours sleep'))).toBeVisible();
    expect(element(by.id('complete-setup-button'))).toBeNotVisible();
  });
});
```

#### 5.2.2 Dashboard Interaction Test  
```typescript
// e2e/dashboard.e2e.ts
describe('Dashboard Interactions', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await mockUserWithSleepData(); // Helper to simulate user with data
  });

  it('displays sleep score and key metrics correctly', async () => {
    // Verify main elements visible
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.id('sleep-score-circle'))).toBeVisible();
    await expect(element(by.id('quick-metrics-row'))).toBeVisible();
    
    // Verify sleep score value
    await expect(element(by.id('sleep-score-value'))).toHaveText('85');
    await expect(element(by.text('Good Sleep'))).toBeVisible();
    
    // Verify metrics
    await expect(element(by.id('total-duration'))).toHaveText('7h 45m');
    await expect(element(by.id('sleep-efficiency'))).toHaveText('92%');
    await expect(element(by.id('rem-duration'))).toHaveText('1h 30m');
  });

  it('navigates to analytics when sleep score tapped', async () => {
    await element(by.id('sleep-score-circle')).tap();
    
    await expect(element(by.id('analytics-screen'))).toBeVisible();
    await expect(element(by.text('Sleep Analytics'))).toBeVisible();
    await expect(element(by.id('sleep-trends-chart'))).toBeVisible();
  });

  it('refreshes data when pulled down', async () => {
    // Initial state
    await expect(element(by.id('sleep-score-value'))).toHaveText('85');
    
    // Mock new data
    await mockUpdatedSleepData();
    
    // Pull to refresh
    await element(by.id('dashboard-scroll-view')).swipe('down', 'fast');
    
    // Wait for refresh to complete
    await waitFor(element(by.id('loading-indicator')))
      .not.toBeVisible()
      .withTimeout(5000);
    
    // Verify updated data
    await expect(element(by.id('sleep-score-value'))).toHaveText('88');
  });

  it('handles no sleep data gracefully', async () => {
    await mockUserWithoutSleepData();
    await device.reloadReactNative();
    
    // Verify empty state
    await expect(element(by.id('empty-state-container'))).toBeVisible();
    await expect(element(by.text('No sleep data available'))).toBeVisible();
    await expect(element(by.id('sync-data-button'))).toBeVisible();
    
    // Test sync action
    await element(by.id('sync-data-button')).tap();
    await expect(element(by.id('loading-indicator'))).toBeVisible();
  });
});
```

#### 5.2.3 AI Chat Flow Test
```typescript
// e2e/ai-chat.e2e.ts  
describe('AI Chat Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await mockUserWithSleepData();
    await navigateToTab('chat');
  });

  it('sends message and receives AI response', async () => {
    await expect(element(by.id('chat-screen'))).toBeVisible();
    
    // Type message
    const messageInput = element(by.id('chat-input'));
    await messageInput.tap();
    await messageInput.typeText('How can I improve my deep sleep?');
    
    // Send message
    await element(by.id('send-button')).tap();
    
    // Verify user message appears
    await expect(element(by.text('How can I improve my deep sleep?'))).toBeVisible();
    
    // Wait for AI response
    await waitFor(element(by.id('ai-message-0')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify response contains relevant content
    const aiMessage = element(by.id('ai-message-0'));
    await expect(aiMessage).toBeVisible();
    
    // Check if response mentions deep sleep
    await expect(element(by.text(matching(/deep sleep/i)))).toBeVisible();
  });

  it('handles typing and sending flow correctly', async () => {
    const messageInput = element(by.id('chat-input'));
    
    // Verify send button initially disabled
    await expect(element(by.id('send-button'))).not.toBeVisible();
    
    // Type message
    await messageInput.tap();
    await messageInput.typeText('Test message');
    
    // Send button should appear
    await expect(element(by.id('send-button'))).toBeVisible();
    
    // Clear message
    await messageInput.clearText();
    
    // Send button should disappear
    await expect(element(by.id('send-button'))).not.toBeVisible();
  });

  it('shows conversation history', async () => {
    // Send first message
    await sendChatMessage('What affects sleep quality?');
    await waitForAIResponse();
    
    // Send second message  
    await sendChatMessage('How many hours should I sleep?');
    await waitForAIResponse();
    
    // Verify both messages and responses visible
    await expect(element(by.text('What affects sleep quality?'))).toBeVisible();
    await expect(element(by.text('How many hours should I sleep?'))).toBeVisible();
    
    // Verify conversation order (newest at bottom)
    const messages = await element(by.id('chat-messages-list'));
    await expect(messages).toBeVisible();
  });

  it('handles offline state gracefully', async () => {
    // Simulate offline state
    await device.setURLBlacklist(['**/openai**']);
    
    await sendChatMessage('Test offline message');
    
    // Should show offline fallback response
    await waitFor(element(by.text(matching(/currently unable/i))))
      .toBeVisible()
      .withTimeout(5000);
    
    // Clear blacklist
    await device.setURLBlacklist([]);
  });
});
```

### 5.3 Device and Platform Testing

#### 5.3.1 Multi-Device Test Matrix
| Device Model | iOS Version | Screen Size | Test Priority |
|--------------|-------------|-------------|---------------|
| iPhone SE (3rd gen) | iOS 16 | 4.7" | High |
| iPhone 14 | iOS 17 | 6.1" | High |
| iPhone 14 Pro | iOS 17 | 6.1" | Medium |
| iPhone 14 Pro Max | iOS 17 | 6.7" | Medium |
| iPhone 15 | iOS 17 | 6.1" | High |
| iPad Air | iPadOS 17 | 10.9" | Low |

#### 5.3.2 Cross-Device Test Scenarios
```typescript
// e2e/cross-device.e2e.ts
describe('Cross-Device Compatibility', () => {
  const devices = ['iPhone SE', 'iPhone 14', 'iPhone 14 Pro Max'];
  
  devices.forEach(deviceName => {
    describe(`${deviceName} Tests`, () => {
      beforeEach(async () => {
        await device.selectDevice(deviceName);
        await device.reloadReactNative();
      });

      it('displays UI elements correctly on different screen sizes', async () => {
        await mockUserWithSleepData();
        
        // Dashboard elements should be visible and properly sized
        await expect(element(by.id('sleep-score-circle'))).toBeVisible();
        await expect(element(by.id('quick-metrics-row'))).toBeVisible();
        
        // Take screenshot for visual comparison
        await device.takeScreenshot(`dashboard-${deviceName}`);
        
        // Verify key elements are not clipped
        const scoreCircle = await element(by.id('sleep-score-circle')).getAttributes();
        expect(scoreCircle.visible).toBe(true);
      });

      it('handles touch interactions appropriately', async () => {
        // Test that touch targets are accessible on smaller screens
        await element(by.id('sleep-score-circle')).tap();
        await expect(element(by.id('analytics-screen'))).toBeVisible();
        
        // Test tab navigation
        await element(by.id('chat-tab')).tap();
        await expect(element(by.id('chat-screen'))).toBeVisible();
      });
    });
  });
});
```

## 6. Performance Testing

### 6.1 Performance Test Scenarios

#### 6.1.1 App Startup Performance
```typescript
// __tests__/performance/startup.test.ts
describe('App Startup Performance', () => {
  it('launches within performance targets', async () => {
    const startTime = Date.now();
    
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    const launchTime = Date.now() - startTime;
    
    // Target: Launch in under 3 seconds
    expect(launchTime).toBeLessThan(3000);
    
    // Log performance metrics
    console.log(`App launch time: ${launchTime}ms`);
  });

  it('handles background/foreground transitions smoothly', async () => {
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
    
    const startTime = Date.now();
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(2000);
    
    const resumeTime = Date.now() - startTime;
    
    // Target: Resume in under 1 second
    expect(resumeTime).toBeLessThan(1000);
  });
});
```

#### 6.1.2 Data Processing Performance
```typescript
// __tests__/performance/dataProcessing.test.ts
describe('Data Processing Performance', () => {
  it('processes large sleep datasets within time limits', async () => {
    const largeSleepDataset = generateMockSleepData(365); // 1 year of data
    const sleepDataService = new SleepDataService();
    
    const startTime = performance.now();
    const processedData = await sleepDataService.processSleepTrends(largeSleepDataset);
    const processingTime = performance.now() - startTime;
    
    // Target: Process 1 year of data in under 2 seconds
    expect(processingTime).toBeLessThan(2000);
    expect(processedData).toBeDefined();
    expect(processedData.trends).toHaveLength(12); // Monthly trends
  });

  it('renders charts with large datasets smoothly', async () => {
    const { getByTestId } = render(
      <SleepTrendsChart data={generateMockSleepData(90)} />
    );
    
    const startTime = performance.now();
    
    // Wait for chart to render
    await waitFor(() => 
      expect(getByTestId('trends-chart')).toBeTruthy()
    );
    
    const renderTime = performance.now() - startTime;
    
    // Target: Render 90 days of data in under 1 second
    expect(renderTime).toBeLessThan(1000);
  });
});
```

### 6.2 Memory and Resource Testing

#### 6.2.1 Memory Leak Detection
```typescript
// __tests__/performance/memory.test.ts
describe('Memory Management', () => {
  it('does not leak memory during normal usage', async () => {
    // Get initial memory usage
    const initialMemory = await device.getMemoryUsage();
    
    // Simulate extended app usage
    for (let i = 0; i < 10; i++) {
      await navigateToTab('dashboard');
      await navigateToTab('analytics');
      await navigateToTab('chat');
      await sendChatMessage('Test message');
      await waitForAIResponse();
    }
    
    // Force garbage collection if possible
    await device.triggerGarbageCollection();
    
    const finalMemory = await device.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (under 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('handles large data sets without memory issues', async () => {
    // Load large amount of historical sleep data
    const largeDataset = generateMockSleepData(730); // 2 years
    await mockHealthKitDataReturn(largeDataset);
    
    await element(by.id('sync-data-button')).tap();
    
    // Monitor memory during data processing
    const memoryBeforeSync = await device.getMemoryUsage();
    
    await waitFor(element(by.text('Sync complete')))
      .toBeVisible()
      .withTimeout(10000);
    
    const memoryAfterSync = await device.getMemoryUsage();
    const memoryUsage = memoryAfterSync - memoryBeforeSync;
    
    // Memory usage should stay under 100MB even with large datasets
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
  });
});
```

## 7. Security Testing

### 7.1 Data Privacy Tests

#### 7.1.1 Data Encryption Tests
```typescript
// __tests__/security/encryption.test.ts
import { SecureStorageService } from '@/services/SecureStorageService';
import { DatabaseService } from '@/services/DatabaseService';

describe('Data Encryption', () => {
  it('encrypts sensitive data in secure storage', async () => {
    const secureStorage = new SecureStorageService();
    const sensitiveData = {
      userId: 'user123',
      sleepGoals: { bedtime: '23:00', wakeTime: '07:00' }
    };
    
    await secureStorage.storeUserData(sensitiveData);
    
    // Verify data is not stored in plain text
    const rawStorageData = await secureStorage.getRawStorageData();
    expect(rawStorageData).not.toContain('user123');
    expect(rawStorageData).not.toContain('23:00');
    
    // Verify data can be properly decrypted
    const retrievedData = await secureStorage.getUserData();
    expect(retrievedData).toEqual(sensitiveData);
  });

  it('encrypts database with proper key management', async () => {
    const dbService = new DatabaseService();
    
    // Verify database file is encrypted
    const dbPath = await dbService.getDatabasePath();
    const dbContent = await readFileRaw(dbPath);
    
    // Should not contain readable sleep data
    expect(dbContent).not.toContain('sleep_sessions');
    expect(dbContent).not.toContain('user_id');
    
    // But should be accessible through service
    const sessions = await dbService.getSleepSessions();
    expect(sessions).toBeDefined();
  });
});
```

#### 7.1.2 Data Transmission Security Tests
```typescript
// __tests__/security/transmission.test.ts
describe('Data Transmission Security', () => {
  it('sanitizes data before AI API calls', async () => {
    const aiService = new AIService();
    const fetchSpy = jest.spyOn(global, 'fetch');
    
    const userMessage = "My name is John Doe and I live at 123 Main St. How's my sleep?";
    const contextData = {
      recentSessions: [mockSleepSessionWithPII],
      userProfile: mockUserProfileWithPII
    };
    
    await aiService.getRecommendation(userMessage, contextData);
    
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    const sanitizedContent = JSON.stringify(requestBody);
    
    // Verify PII is removed
    expect(sanitizedContent).not.toContain('John Doe');
    expect(sanitizedContent).not.toContain('123 Main St');
    expect(sanitizedContent).not.toContain(mockUserProfileWithPII.email);
    
    // Verify sleep data is anonymized but preserved
    expect(sanitizedContent).toContain('sleep_duration');
    expect(sanitizedContent).not.toContain('user_id');
  });

  it('uses HTTPS for all external requests', async () => {
    const aiService = new AIService();
    const fetchSpy = jest.spyOn(global, 'fetch');
    
    await aiService.getRecommendation('Test message', mockSleepContext);
    
    const requestUrl = fetchSpy.mock.calls[0][0];
    expect(requestUrl).toMatch(/^https:/);
  });

  it('validates API responses for security', async () => {
    const aiService = new AIService();
    
    // Mock malicious response
    jest.spyOn(global, 'fetch').mockResolvedValue(
      createMockResponse({
        choices: [{
          message: {
            content: '<script>alert("xss")</script>Recommendation text'
          }
        }]
      })
    );
    
    const response = await aiService.getRecommendation('Test', mockSleepContext);
    
    // Should sanitize potential XSS
    expect(response).not.toContain('<script>');
    expect(response).not.toContain('alert');
    expect(response).toContain('Recommendation text');
  });
});
```

### 7.2 Authentication and Authorization Tests

#### 7.2.1 Biometric Authentication Tests
```typescript
// __tests__/security/authentication.test.ts
describe('Biometric Authentication', () => {
  it('requires biometric authentication for sensitive operations', async () => {
    const authService = new AuthenticationService();
    
    // Mock biometric authentication available
    jest.spyOn(authService, 'isBiometricAvailable')
      .mockResolvedValue(true);
    
    // Attempt to access sensitive data
    const dataRequest = authService.accessSensitiveData();
    
    // Should trigger biometric prompt
    expect(authService.lastBiometricRequest).toBeDefined();
    expect(authService.lastBiometricRequest.promptMessage)
      .toContain('authenticate to access');
  });

  it('falls back to passcode when biometric unavailable', async () => {
    const authService = new AuthenticationService();
    
    // Mock biometric unavailable
    jest.spyOn(authService, 'isBiometricAvailable')
      .mockResolvedValue(false);
    
    const result = await authService.authenticate();
    
    // Should fall back to device passcode
    expect(result.method).toBe('passcode');
    expect(result.success).toBe(true);
  });

  it('handles authentication failure gracefully', async () => {
    const authService = new AuthenticationService();
    
    // Mock authentication failure
    jest.spyOn(authService, 'authenticateWithBiometric')
      .mockResolvedValue({ success: false, error: 'User cancelled' });
    
    const result = await authService.authenticate();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelled');
    
    // Should not grant access to sensitive data
    const sensitiveData = await authService.accessSensitiveData();
    expect(sensitiveData).toBeNull();
  });
});
```

## 8. Accessibility Testing

### 8.1 Screen Reader Testing

#### 8.1.1 VoiceOver Navigation Tests
```typescript
// __tests__/accessibility/voiceover.test.ts
describe('VoiceOver Accessibility', () => {
  beforeEach(async () => {
    // Enable VoiceOver for testing
    await device.setAccessibility(true);
  });

  it('provides appropriate labels for sleep score elements', async () => {
    await mockUserWithSleepData();
    
    const sleepScoreElement = element(by.id('sleep-score-circle'));
    const attributes = await sleepScoreElement.getAttributes();
    
    expect(attributes.label).toBe('Sleep score: 85 out of 100');
    expect(attributes.hint).toBe('Double tap to view detailed sleep analysis');
    expect(attributes.accessibilityRole).toBe('button');
  });

  it('announces dynamic content changes', async () => {
    const { getByTestId } = render(<Dashboard />);
    
    // Mock sleep score update
    act(() => {
      updateSleepScore(88);
    });
    
    // Should announce the change
    await waitFor(() => {
      expect(announceForAccessibility).toHaveBeenCalledWith(
        'Sleep score updated to 88'
      );
    });
  });

  it('provides logical reading order for complex layouts', async () => {
    const dashboardElements = await element(by.id('dashboard-screen'))
      .getAccessibilityElements();
    
    // Verify reading order: Header → Sleep Score → Metrics → Charts
    expect(dashboardElements[0].label).toContain('Good morning');
    expect(dashboardElements[1].label).toContain('Sleep score');
    expect(dashboardElements[2].label).toContain('Total sleep time');
    expect(dashboardElements[3].label).toContain('Sleep efficiency');
  });

  it('handles chart data accessibility correctly', async () => {
    const chartElement = element(by.id('sleep-trends-chart'));
    const attributes = await chartElement.getAttributes();
    
    expect(attributes.label).toContain('Sleep trends chart');
    expect(attributes.hint).toContain('Shows sleep scores over the last 30 days');
    
    // Should provide data summary for screen readers
    expect(attributes.value).toContain('Average score 82');
    expect(attributes.value).toContain('Trend improving');
  });
});
```

### 8.2 Color Contrast and Visual Accessibility

#### 8.2.1 Color Contrast Tests
```typescript
// __tests__/accessibility/contrast.test.ts
describe('Color Contrast Accessibility', () => {
  it('meets WCAG AA contrast requirements', () => {
    const colorPairs = [
      { bg: '#0B0D1A', fg: '#FFFFFF' }, // Dark theme primary text
      { bg: '#FFFFFF', fg: '#1F2937' }, // Light theme primary text
      { bg: '#6366F1', fg: '#FFFFFF' }, // Primary button
      { bg: '#1E2139', fg: '#9CA3AF' }, // Secondary text on cards
    ];

    colorPairs.forEach(({ bg, fg }) => {
      const contrastRatio = calculateContrastRatio(bg, fg);
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5); // WCAG AA requirement
    });
  });

  it('does not rely solely on color for information', () => {
    const { getByTestId } = render(<SleepPhasesChart />);
    
    const remPhase = getByTestId('sleep-phase-rem');
    const deepPhase = getByTestId('sleep-phase-deep');
    
    // Should have text labels in addition to colors
    expect(remPhase).toHaveTextContent('REM');
    expect(deepPhase).toHaveTextContent('Deep');
    
    // Should have patterns or icons as additional indicators
    expect(remPhase).toHaveStyle({ backgroundPattern: 'diagonal-lines' });
    expect(deepPhase).toHaveStyle({ backgroundPattern: 'solid' });
  });
});
```

### 8.3 Dynamic Type and Size Testing

#### 8.3.1 Dynamic Type Support Tests
```typescript
// __tests__/accessibility/dynamicType.test.ts
describe('Dynamic Type Support', () => {
  const typeSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  typeSizes.forEach(size => {
    it(`renders correctly with ${size} text size`, async () => {
      await device.setContentSizeCategory(size);
      await device.reloadReactNative();
      
      // Verify key elements still visible and accessible
      await expect(element(by.id('sleep-score-circle'))).toBeVisible();
      await expect(element(by.id('sleep-score-value'))).toBeVisible();
      
      // Take screenshot for visual verification
      await device.takeScreenshot(`dynamic-type-${size}`);
      
      // Verify text doesn't get clipped
      const scoreElement = await element(by.id('sleep-score-value'))
        .getAttributes();
      expect(scoreElement.visible).toBe(true);
    });
  });

  it('handles extreme text sizes gracefully', async () => {
    await device.setContentSizeCategory('AX5'); // Largest accessibility size
    await device.reloadReactNative();
    
    // UI should adapt but remain functional
    await element(by.id('sleep-score-circle')).tap();
    await expect(element(by.id('analytics-screen'))).toBeVisible();
    
    // Text should be readable
    const headerText = await element(by.id('analytics-header'))
      .getAttributes();
    expect(headerText.visible).toBe(true);
  });
});
```

## 9. Test Data Management

### 9.1 Test Data Strategy

#### 9.1.1 Mock Data Generation
```typescript
// __tests__/fixtures/sleepDataGenerator.ts
export class SleepDataGenerator {
  generateSleepSession(options: Partial<SleepSessionOptions> = {}): SleepSession {
    const defaults: SleepSessionOptions = {
      duration: 8 * 60, // 8 hours in minutes
      efficiency: 0.9,
      remPercentage: 0.2,
      deepPercentage: 0.2,
      corePercentage: 0.5,
      awakePercentage: 0.1,
      startTime: new Date('2025-01-15T23:00:00Z'),
    };
    
    const config = { ...defaults, ...options };
    
    return {
      id: generateId(),
      startTime: config.startTime,
      endTime: new Date(config.startTime.getTime() + config.duration * 60 * 1000),
      totalDurationMinutes: config.duration,
      sleepEfficiency: config.efficiency * 100,
      phases: this.generateSleepPhases(config),
      source: 'test_data',
    };
  }

  generateSleepDataset(days: number, pattern: 'consistent' | 'improving' | 'declining' | 'irregular' = 'consistent'): SleepSession[] {
    const sessions: SleepSession[] = [];
    const baseDate = new Date('2025-01-01T23:00:00Z');
    
    for (let i = 0; i < days; i++) {
      const sessionDate = new Date(baseDate);
      sessionDate.setDate(baseDate.getDate() + i);
      
      const sessionOptions = this.getSessionOptionsForPattern(pattern, i, days);
      sessionOptions.startTime = sessionDate;
      
      sessions.push(this.generateSleepSession(sessionOptions));
    }
    
    return sessions;
  }

  private generateSleepPhases(config: SleepSessionOptions): SleepPhase[] {
    const phases: SleepPhase[] = [];
    let currentTime = new Date(config.startTime);
    
    // Generate phases based on percentages
    const phaseDurations = {
      core: config.duration * config.corePercentage,
      deep: config.duration * config.deepPercentage,
      rem: config.duration * config.remPercentage,
      awake: config.duration * config.awakePercentage,
    };
    
    // Add phases in realistic order
    const phaseOrder: Array<keyof typeof phaseDurations> = ['core', 'deep', 'rem', 'awake'];
    
    phaseOrder.forEach(phaseType => {
      if (phaseDurations[phaseType] > 0) {
        const duration = phaseDurations[phaseType];
        const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);
        
        phases.push({
          id: generateId(),
          sessionId: 0, // Will be set by parent
          phaseType,
          startTime: new Date(currentTime),
          endTime,
          durationMinutes: duration,
        });
        
        currentTime = endTime;
      }
    });
    
    return phases;
  }
}

// Usage in tests
const generator = new SleepDataGenerator();

// Generate single session
const goodSleepSession = generator.generateSleepSession({
  duration: 480, // 8 hours
  efficiency: 0.92,
});

// Generate dataset with improving pattern
const improvingData = generator.generateSleepDataset(30, 'improving');
```

### 9.2 Test Environment Management

#### 9.2.1 Environment Setup and Teardown
```typescript
// __tests__/setup/testEnvironment.ts
export class TestEnvironmentManager {
  async setupTestEnvironment(): Promise<void> {
    // Clear any existing data
    await this.clearTestData();
    
    // Setup mock services
    await this.setupMockServices();
    
    // Initialize test database
    await this.setupTestDatabase();
    
    // Setup mock HealthKit data
    await this.setupMockHealthKit();
  }

  async teardownTestEnvironment(): Promise<void> {
    // Clear test data
    await this.clearTestData();
    
    // Reset mock services
    await this.resetMocks();
    
    // Close database connections
    await this.closeDatabaseConnections();
  }

  private async setupMockServices(): Promise<void> {
    // Mock HealthKit service
    jest.mock('@/services/HealthKitService', () => ({
      HealthKitService: jest.fn().mockImplementation(() => ({
        hasPermissions: jest.fn().mockResolvedValue(true),
        getSleepSamples: jest.fn().mockResolvedValue(mockSleepSamples),
        syncSleepData: jest.fn().mockResolvedValue({ success: true }),
      })),
    }));

    // Mock AI service
    jest.mock('@/services/AIService', () => ({
      AIService: jest.fn().mockImplementation(() => ({
        getRecommendation: jest.fn().mockResolvedValue('Mock AI response'),
        sanitizeInput: jest.fn().mockImplementation(input => input),
      })),
    }));
  }

  private async setupTestDatabase(): Promise<void> {
    const dbService = new DatabaseService();
    await dbService.initializeTestDatabase();
    await dbService.runMigrations();
    await dbService.seedTestData();
  }
}

// Global test setup
beforeEach(async () => {
  const testEnv = new TestEnvironmentManager();
  await testEnv.setupTestEnvironment();
});

afterEach(async () => {
  const testEnv = new TestEnvironmentManager();
  await testEnv.teardownTestEnvironment();
});
```

## 10. Continuous Integration Testing

### 10.1 CI/CD Pipeline Configuration

#### 10.1.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Automated Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage --watchAll=false
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: integration-test-results
        path: test-results/

  e2e-tests:
    runs-on: macos-latest
    needs: integration-tests
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup iOS Simulator
      run: |
        xcrun simctl create "iPhone 14" "iPhone 14" "iOS 16.4"
        xcrun simctl boot "iPhone 14"
    
    - name: Build iOS app
      run: npm run build:ios:e2e
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload E2E test results
      uses: actions/upload-artifact@v3
      with:
        name: e2e-test-results
        path: e2e-results/

  performance-tests:
    runs-on: macos-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Upload performance report
      uses: actions/upload-artifact@v3
      with:
        name: performance-report
        path: performance-results/
```

### 10.2 Quality Gates and Metrics

#### 10.2.1 Test Coverage Requirements
```json
// package.json scripts
{
  "scripts": {
    "test:unit": "jest --config jest.config.js",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "detox test --configuration ios.sim.release",
    "test:performance": "jest --config jest.performance.config.js",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:coverage": "jest --coverage --coverageReporters=lcov --coverageReporters=text-summary"
  }
}
```

#### 10.2.2 Quality Metrics Dashboard
```typescript
// scripts/generateQualityReport.ts
interface QualityMetrics {
  testCoverage: {
    unit: number;
    integration: number;
    e2e: number;
    overall: number;
  };
  performance: {
    appLaunchTime: number;
    memoryUsage: number;
    bundleSize: number;
  };
  defects: {
    critical: number;
    major: number;
    minor: number;
  };
}

export function generateQualityReport(): QualityMetrics {
  return {
    testCoverage: {
      unit: getCoverageFromJest(),
      integration: getIntegrationCoverage(),
      e2e: getE2ECoverage(),
      overall: calculateOverallCoverage(),
    },
    performance: {
      appLaunchTime: getAverageLaunchTime(),
      memoryUsage: getAverageMemoryUsage(),
      bundleSize: getBundleSize(),
    },
    defects: {
      critical: getCriticalDefectCount(),
      major: getMajorDefectCount(),
      minor: getMinorDefectCount(),
    },
  };
}
```

## 11. Testing Documentation and Reporting

### 11.1 Test Documentation Standards

#### 11.1.1 Test Case Documentation Template
```markdown
# Test Case: TC-001 - User Onboarding Flow

## Test Information
- **Test ID**: TC-001
- **Test Type**: E2E
- **Priority**: High
- **Automation Status**: Automated
- **Created**: 2025-01-15
- **Last Updated**: 2025-01-15

## Test Objective
Verify that new users can complete the onboarding process successfully and access the main dashboard.

## Preconditions
- App is installed on device
- Device has iOS 16+ 
- No previous app data exists

## Test Steps
1. Launch the app for the first time
2. Tap "Get Started" on welcome screen
3. Tap "Connect Apple Health" on permissions screen
4. Grant HealthKit permissions when prompted
5. Set sleep goal to 8 hours
6. Set bedtime to 11:00 PM
7. Set wake time to 7:00 AM
8. Tap "Complete Setup"

## Expected Results
- User successfully navigates through all onboarding screens
- Health permissions are granted
- Sleep goals are saved
- User reaches dashboard with "Welcome" message
- Sleep score is displayed (may be empty initially)

## Test Data
- Sleep Goal: 8 hours
- Bedtime: 11:00 PM
- Wake Time: 7:00 AM

## Automation Notes
- Uses mock HealthKit data for consistent testing
- Screenshots captured at each step
- Accessibility labels verified
```

### 11.2 Test Reporting Framework

#### 11.2.1 Automated Test Reports
```typescript
// scripts/testReporter.ts
export class TestReporter {
  generateTestReport(results: TestResults): TestReport {
    return {
      summary: {
        totalTests: results.total,
        passed: results.passed,
        failed: results.failed,
        skipped: results.skipped,
        passRate: (results.passed / results.total) * 100,
      },
      coverage: {
        lines: results.coverage.lines,
        functions: results.coverage.functions,
        branches: results.coverage.branches,
        statements: results.coverage.statements,
      },
      performance: {
        testExecutionTime: results.executionTime,
        slowestTests: results.slowestTests,
        averageTestTime: results.averageTestTime,
      },
      failures: results.failures.map(failure => ({
        testName: failure.testName,
        error: failure.error,
        screenshot: failure.screenshot,
        stackTrace: failure.stackTrace,
      })),
    };
  }

  generateHTMLReport(report: TestReport): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lunar App Test Report</title>
        <style>${this.getReportStyles()}</style>
      </head>
      <body>
        <div class="container">
          <h1>Test Execution Report</h1>
          <div class="summary">
            <h2>Test Summary</h2>
            <div class="metric">
              <span class="label">Total Tests:</span>
              <span class="value">${report.summary.totalTests}</span>
            </div>
            <div class="metric">
              <span class="label">Pass Rate:</span>
              <span class="value ${report.summary.passRate >= 95 ? 'success' : 'warning'}">
                ${report.summary.passRate.toFixed(1)}%
              </span>
            </div>
            <!-- More report content -->
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
```

## 12. Future Testing Enhancements

### 12.1 Advanced Testing Techniques

#### 12.1.1 Visual Regression Testing
```typescript
// Future implementation for visual regression testing
describe('Visual Regression Tests', () => {
  it('matches dashboard screenshot across updates', async () => {
    await mockUserWithSleepData();
    
    // Take screenshot
    const screenshot = await device.takeScreenshot('dashboard-baseline');
    
    // Compare with baseline image
    const comparisonResult = await compareScreenshots(
      screenshot,
      './visual-baselines/dashboard-baseline.png',
      { threshold: 0.1 } // 10% difference tolerance
    );
    
    expect(comparisonResult.difference).toBeLessThan(0.1);
  });
});
```

#### 12.1.2 AI Response Quality Testing
```typescript
// Future implementation for AI response quality validation
describe('AI Response Quality', () => {
  it('generates contextually relevant recommendations', async () => {
    const testScenarios = [
      {
        sleepData: mockPoorSleepData,
        expectedTopics: ['sleep hygiene', 'bedtime routine', 'stress management'],
        query: 'How can I sleep better?'
      },
      {
        sleepData: mockGoodSleepData,
        expectedTopics: ['maintain routine', 'consistency'],
        query: 'My sleep is good, what should I focus on?'
      }
    ];
    
    for (const scenario of testScenarios) {
      const response = await aiService.getRecommendation(
        scenario.query, 
        scenario.sleepData
      );
      
      // Use NLP to verify response relevance
      const topicAnalysis = await analyzeResponseTopics(response);
      
      scenario.expectedTopics.forEach(topic => {
        expect(topicAnalysis.topics).toContainSimilarTopic(topic);
      });
      
      expect(topicAnalysis.relevanceScore).toBeGreaterThan(0.7);
    }
  });
});
```

---

**Document Status**: Ready for Technical Review
**Next Review Date**: September 15, 2025
**Document Owner**: QA Engineering Team
**Implementation Start**: Sprint 1 (September 15, 2025)