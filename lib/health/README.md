# Health Integration Service

Comprehensive health data integration for the Lunar Sleep Analysis App, providing cross-platform access to sleep and health data from iOS HealthKit, Android Health Connect, and manual web entry.

## Features

### 🏥 Cross-Platform Health Data Access
- **iOS**: Full HealthKit integration with Apple Watch support
- **Android**: Health Connect API integration with multiple device support
- **Web**: Manual data entry and file import capabilities

### 📊 Comprehensive Data Types
- Sleep analysis data (sleep stages: REM, Deep, Light, Awake)
- Sleep duration and timing
- Heart rate during sleep
- Respiratory rate data
- Sleep schedule and bedtime/wake time

### 🔄 Real-Time Synchronization
- Automatic background sync (iOS/Android)
- Real-time health data monitoring
- Conflict resolution for overlapping data sources
- Data deduplication and quality validation

### 🛡️ Privacy & Security
- Local storage only (no cloud sync)
- Privacy-compliant data handling
- Encryption for sensitive data
- Granular permission management

### 📈 Data Quality & Analytics
- Comprehensive data validation
- Quality scoring and metrics
- Health insights generation
- Gap analysis and completeness tracking

## Installation

The health integration service is included in the Lunar app. Ensure you have the required dependencies:

```bash
npm install react-native-health @react-native-async-storage/async-storage
```

For iOS, add HealthKit capability in `ios/YourApp/YourApp.entitlements`:

```xml
<key>com.apple.developer.healthkit</key>
<true/>
<key>com.apple.developer.healthkit.access</key>
<array>
    <string>health-records</string>
</array>
```

For Android, add Health Connect permissions in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.health.READ_SLEEP" />
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />
<uses-permission android:name="android.permission.health.READ_RESPIRATORY_RATE" />
```

## Quick Start

### Basic Setup

```typescript
import { HealthServiceManager } from '@/lib/health';

const healthManager = new HealthServiceManager();

// Initialize with default configuration
await healthManager.initialize();

// Perform initial sync
await healthManager.performInitialSync();

// Setup background sync (iOS/Android only)
await healthManager.setupBackgroundSync(30); // 30 minutes interval
```

### Simple Health Data Access

```typescript
import { getHealthService } from '@/lib/health';

const healthService = getHealthService();

// Initialize service
await healthService.initialize({
  enableBackgroundSync: true,
  syncInterval: 30,
  maxHistoryDays: 365,
});

// Request permissions
await healthService.requestPermissions({
  sleepAnalysis: true,
  heartRate: true,
  respiratoryRate: true,
});

// Sync health data
const result = await healthService.syncHealthData();
console.log(`Imported ${result.sessionsImported} sleep sessions`);
```

### React Hook Usage

```typescript
import { useHealthService } from '@/lib/health';

function HealthComponent() {
  const { healthService, platform, capabilities, isSupported } = useHealthService();

  useEffect(() => {
    if (isSupported) {
      initializeHealth();
    }
  }, []);

  const initializeHealth = async () => {
    await healthService.initialize();
    if (capabilities.requiresPermissions) {
      await healthService.requestPermissions({
        sleepAnalysis: true,
        heartRate: true,
      });
    }
  };

  // ... component implementation
}
```

## Platform-Specific Usage

### iOS HealthKit

```typescript
import { HealthKitService } from '@/lib/health/healthService.ios';

const healthKit = new HealthKitService();

// Check if HealthKit is available
await healthKit.initialize();

// Get sleep data with stages
const sleepData = await healthKit.getSleepData(
  new Date('2023-01-01'),
  new Date('2023-01-31')
);

// Get heart rate data during sleep
const heartRateData = await healthKit.getHeartRateData(
  startDate,
  endDate
);
```

### Android Health Connect

```typescript
import { HealthConnectService } from '@/lib/health/healthService.android';

const healthConnect = new HealthConnectService();

// Initialize Health Connect
await healthConnect.initialize();

// Enable background sync with battery optimization
await healthConnect.enableBackgroundSync({
  enabled: true,
  interval: 60,
  batteryOptimization: true,
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00',
  },
});
```

### Web Manual Entry

```typescript
import { WebHealthService } from '@/lib/health/healthService.web';

const webHealth = new WebHealthService();

// Add manual sleep session
await webHealth.addManualSleepSession({
  startTime: new Date('2023-12-01T22:30:00'),
  endTime: new Date('2023-12-02T07:00:00'),
  quality: 85,
  notes: 'Good sleep quality',
});

// Import data from file
const file = new File([csvData], 'sleep-data.csv', { type: 'text/csv' });
const importResult = await webHealth.importFromFile(file);
```

## Database Integration

The health service integrates seamlessly with the app's SQLite database:

```typescript
import { HealthDatabaseIntegration } from '@/lib/health/healthDatabaseIntegration';

const dbIntegration = new HealthDatabaseIntegration();

// Import health sessions into database
const importResult = await dbIntegration.importHealthSessions(
  processedSessions,
  userId,
  {
    resolveConflicts: true,
    updateExisting: true,
  }
);

// Get health data statistics
const stats = await dbIntegration.getHealthDataStatistics(userId, 30);
console.log(`${stats.totalSessions} sessions, ${stats.dataCompleteness}% complete`);
```

## Data Validation & Quality

### Automatic Validation

```typescript
const healthService = getHealthService();

// Validate sleep data
const sleepData = await healthService.getSleepData(startDate, endDate);
const validation = healthService.validateData(sleepData);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Validation warnings:', validation.warnings);
}

console.log(`Data confidence: ${validation.confidence * 100}%`);
```

### Data Quality Metrics

```typescript
const qualityMetrics = await healthService.getDataQualityMetrics();

console.log('Data Quality Report:', {
  completeness: `${qualityMetrics.completeness}%`,
  accuracy: `${qualityMetrics.accuracy}%`,
  consistency: `${qualityMetrics.consistency}%`,
  timeliness: `${qualityMetrics.timeliness}%`,
  gaps: qualityMetrics.gapAnalysis,
});
```

## Health Insights Generation

```typescript
import { generateHealthInsights } from '@/lib/health/utils';

// Generate insights from sleep sessions
const insights = generateHealthInsights(sleepSessions, 14); // 14-day window

insights.forEach(insight => {
  console.log(`${insight.type}: ${insight.title}`);
  console.log(`Priority: ${insight.priority}`);
  console.log(`Actionable: ${insight.actionable}`);
  if (insight.suggestedAction) {
    console.log(`Suggestion: ${insight.suggestedAction}`);
  }
});
```

## Error Handling

The health service provides comprehensive error handling:

```typescript
const healthService = getHealthService();

try {
  const result = await healthService.syncHealthData();
  
  if (!result.success) {
    console.error('Sync errors:', result.errors);
    console.warn('Sync warnings:', result.warnings);
  }
  
} catch (error) {
  if (error.message.includes('PERMISSION_DENIED')) {
    // Handle permission issues
    await requestPermissions();
  } else if (error.message.includes('NETWORK_UNAVAILABLE')) {
    // Handle network issues
    scheduleRetry();
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Background Sync & Observers

### Observer Pattern

```typescript
const healthService = getHealthService();

healthService.addObserver({
  onSyncStarted: () => {
    console.log('Sync started');
    showLoadingIndicator();
  },
  
  onSyncCompleted: (result) => {
    console.log('Sync completed:', result);
    hideLoadingIndicator();
    updateUI();
  },
  
  onSyncFailed: (error) => {
    console.error('Sync failed:', error);
    showErrorMessage();
  },
  
  onDataImported: (sessions) => {
    console.log(`Imported ${sessions.length} sessions`);
    refreshSleepData();
  },
});
```

### Background Sync Configuration

```typescript
await healthService.enableBackgroundSync({
  enabled: true,
  interval: 30, // minutes
  batteryOptimization: true,
  wifiOnly: false,
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00',
  },
});
```

## Connected Devices

```typescript
const devices = await healthService.getConnectedDevices();

devices.forEach(device => {
  console.log(`Device: ${device.name} (${device.type})`);
  console.log(`Connected: ${device.isConnected}`);
  console.log(`Capabilities:`, device.capabilities);
  console.log(`Last sync: ${device.lastSyncTime}`);
});
```

## Advanced Configuration

### Custom Health Service Configuration

```typescript
const customConfig = {
  enableBackgroundSync: true,
  syncInterval: 15, // 15 minutes
  maxHistoryDays: 1095, // 3 years
  deduplicationWindow: 10, // 10 minutes
  qualityThreshold: 20, // minimum 20 minutes for valid session
  retryAttempts: 5,
  retryDelay: 2000, // 2 seconds
};

const healthService = getHealthService(customConfig);
```

### Platform Detection

```typescript
import { HealthServiceFactory } from '@/lib/health';

const platform = HealthServiceFactory.getCurrentPlatform();
const capabilities = HealthServiceFactory.getPlatformCapabilities();
const isSupported = HealthServiceFactory.isSupported();

console.log(`Platform: ${platform}`);
console.log(`Supports background sync: ${capabilities.supportsBackgroundSync}`);
console.log(`Requires permissions: ${capabilities.requiresPermissions}`);
```

## Data Export

### Export Health Data

```typescript
// Web platform only
const webHealthService = new WebHealthService();

// Export as JSON
const jsonBlob = await webHealthService.exportToFile('json');
if (jsonBlob) {
  downloadFile(jsonBlob, 'sleep-data.json');
}

// Export as CSV
const csvBlob = await webHealthService.exportToFile('csv');
if (csvBlob) {
  downloadFile(csvBlob, 'sleep-data.csv');
}
```

## Testing & Development

### Mock Data for Development

The web service provides sample data for development and testing:

```typescript
const webHealthService = new WebHealthService();

// Initialize with sample data
await webHealthService.initialize();

// Get sample sleep data (automatically generated)
const sleepData = await webHealthService.getSleepData(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
);

console.log(`Generated ${sleepData.length} sample sessions`);
```

### Testing Validation

```typescript
import { validateSleepData, validateHeartRateData } from '@/lib/health/utils';

// Test custom data validation
const customSleepData = [/* your test data */];
const validation = validateSleepData(customSleepData);

console.log('Validation result:', validation);
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure all required permissions are granted in device settings
2. **No Data Available**: Check if health apps are actually recording data
3. **Sync Failures**: Verify network connectivity and API availability
4. **Battery Optimization**: Disable battery optimization for the app on Android

### Debug Information

```typescript
const healthStatus = await healthManager.getHealthStatus();
console.log('Health Status Debug Info:', JSON.stringify(healthStatus, null, 2));
```

### Performance Monitoring

```typescript
const startTime = Date.now();
const result = await healthService.syncHealthData();
const duration = Date.now() - startTime;

console.log(`Sync completed in ${duration}ms`);
console.log(`Processing time: ${result.processingTime}ms`);
console.log(`Sessions per second: ${result.sessionsImported / (duration / 1000)}`);
```

## API Reference

For detailed API documentation, see the TypeScript definitions in:
- [`types.ts`](./types.ts) - Core type definitions
- [`constants.ts`](./constants.ts) - Configuration constants
- [`utils.ts`](./utils.ts) - Utility functions
- [`index.ts`](./index.ts) - Main service exports

## Contributing

When contributing to the health integration service:

1. Follow the existing TypeScript patterns
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update this README for new functionality
5. Test on all supported platforms

## License

This health integration service is part of the Lunar Sleep Analysis App and follows the same license terms.