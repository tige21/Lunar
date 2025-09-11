# Lunar Sleep Analysis App - Technical Implementation Guide

## Document Information
- **Document Version**: 1.0
- **Created**: September 8, 2025
- **Last Updated**: September 8, 2025
- **Status**: Ready for Development
- **Target Audience**: Development Team

## 1. Development Environment Setup

### 1.1 Prerequisites and System Requirements

#### 1.1.1 Development Machine Requirements
```bash
# macOS (required for iOS development)
macOS 12.0+ (Monterey or later)
Xcode 15.0+ with iOS 17.0+ SDK
Android Studio 2023.1.0+ (Flamingo)

# Hardware Recommendations
RAM: 16GB minimum, 32GB recommended
Storage: 256GB SSD minimum with 50GB free space
Processor: Apple Silicon (M1/M2) or Intel i7 8-core+
```

#### 1.1.2 Core Development Tools
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and npm
brew install node@18
node --version  # Should be 18.18.0+
npm --version   # Should be 9.8.0+

# Install Expo CLI and EAS CLI
npm install -g @expo/cli@latest
npm install -g eas-cli@latest

# Install Watchman for file watching
brew install watchman

# Install CocoaPods for iOS dependencies  
brew install cocoapods
```

#### 1.1.3 IDE and Extensions Setup
```json
// VS Code extensions for React Native development
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest",
    "ms-react-native.react-native-tools",
    "expo.vscode-expo-tools",
    "github.vscode-pull-request-github",
    "ms-vscode.vscode-json"
  ]
}

// VS Code settings for optimal React Native development
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact",
    "javascript": "javascriptreact"
  }
}
```

### 1.2 Project Initialization

#### 1.2.1 Create Expo Project with TypeScript
```bash
# Create new Expo project
npx create-expo-app Lunar --template tabs --typescript

# Navigate to project directory
cd Lunar

# Install additional dependencies
npm install @gluestack-ui/gluestack-ui-provider @gluestack-ui/themed @gluestack-style/react
npm install expo-sqlite expo-secure-store react-native-health
npm install @react-native-async-storage/async-storage expo-haptics
npm install expo-localization expo-constants expo-font

# Install development dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev detox detox-cli
npm install --save-dev flipper react-native-flipper

# Install EAS Build dependencies
npm install --save-dev @expo/cli eas-cli
```

#### 1.2.2 Project Configuration Files

**app.json Configuration:**
```json
{
  "expo": {
    "name": "Lunar",
    "slug": "lunar-sleep-analysis",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "lunar",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a1a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.lunar",
      "buildNumber": "1",
      "infoPlist": {
        "NSHealthShareUsageDescription": "Lunar needs access to your sleep data to provide personalized insights and recommendations.",
        "NSHealthUpdateUsageDescription": "Lunar may write sleep goals and achievements to Apple Health.",
        "NSFaceIDUsageDescription": "Use Face ID to securely access your sleep data.",
        "CFBundleAllowMixedLocalizations": true
      },
      "capabilities": ["HealthKit"]
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a1a1a"
      },
      "package": "com.yourcompany.lunar",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-sqlite",
        {
          "enableFTS": true
        }
      ],
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Allow Lunar to use Face ID for secure authentication"
        }
      ],
      [
        "react-native-health",
        {
          "healthSharePermission": "Allow Lunar to read your sleep data from Apple Health",
          "healthUpdatePermission": "Allow Lunar to write sleep goals to Apple Health"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "tsconfigPaths": true
    }
  }
}
```

**tsconfig.json Configuration:**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

**ESLint Configuration (eslint.config.js):**
```javascript
import eslintConfigExpo from 'eslint-config-expo';

export default [
  ...eslintConfigExpo,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-native/no-inline-styles': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
```

### 1.3 Directory Structure Setup

```bash
# Create the recommended directory structure
mkdir -p src/{components,services,utils,types,constants,hooks}
mkdir -p src/components/{ui,charts,forms,themed}
mkdir -p src/services/{health,database,ai,analytics}
mkdir -p assets/{images,fonts}
mkdir -p __tests__/{components,services,utils}

# Move existing files to src structure
mv components src/
mv constants src/
mv hooks src/

# Create index files for better imports
touch src/components/index.ts
touch src/services/index.ts
touch src/utils/index.ts
touch src/types/index.ts
touch src/constants/index.ts
touch src/hooks/index.ts
```

## 2. Core Service Implementation

### 2.1 Database Service

#### 2.1.1 Database Schema Definition
```typescript
// src/services/database/schema.ts
export interface SleepDataRecord {
  id: string;
  date: string; // ISO date string
  bedTime: string; // ISO datetime string
  sleepTime: string; // ISO datetime string
  wakeTime: string; // ISO datetime string
  totalTimeInBed: number; // minutes
  totalSleepTime: number; // minutes
  sleepEfficiency: number; // percentage (0-100)
  
  // Sleep stages (if available)
  awakeDuration?: number; // minutes
  lightSleepDuration?: number; // minutes
  deepSleepDuration?: number; // minutes
  remSleepDuration?: number; // minutes
  
  // Heart rate data (if available)
  averageHeartRate?: number;
  restingHeartRate?: number;
  heartRateVariability?: number;
  
  // Data source and quality
  dataSource: 'iPhone' | 'Apple Watch' | 'Third Party' | 'Manual';
  dataQuality: 'High' | 'Medium' | 'Low';
  
  // Calculated metrics
  sleepScore?: number; // 0-100
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  
  // Sleep goals
  targetSleepDuration: number; // minutes
  targetBedtime: string; // HH:MM format
  targetWakeTime: string; // HH:MM format
  
  // Notification preferences
  notificationsEnabled: boolean;
  bedtimeReminder: boolean;
  bedtimeReminderOffset: number; // minutes before target bedtime
  wakeUpReminder: boolean;
  
  // Privacy settings
  dataRetentionDays: number; // default 730 (2 years)
  allowAnalytics: boolean;
  biometricAuthEnabled: boolean;
  
  // Display preferences
  theme: 'auto' | 'light' | 'dark';
  language: string; // ISO language code
  temperatureUnit: 'celsius' | 'fahrenheit';
  
  // AI preferences
  aiInsightsEnabled: boolean;
  aiResponseStyle: 'concise' | 'detailed';
  
  createdAt: string;
  updatedAt: string;
}

// Database table creation SQL
export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS sleep_data (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    bed_time TEXT NOT NULL,
    sleep_time TEXT,
    wake_time TEXT NOT NULL,
    total_time_in_bed INTEGER NOT NULL,
    total_sleep_time INTEGER,
    sleep_efficiency REAL,
    awake_duration INTEGER,
    light_sleep_duration INTEGER,
    deep_sleep_duration INTEGER,
    rem_sleep_duration INTEGER,
    average_heart_rate REAL,
    resting_heart_rate REAL,
    heart_rate_variability REAL,
    data_source TEXT NOT NULL,
    data_quality TEXT NOT NULL,
    sleep_score INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    UNIQUE(date, data_source)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    target_sleep_duration INTEGER DEFAULT 480,
    target_bedtime TEXT DEFAULT '22:00',
    target_wake_time TEXT DEFAULT '06:00',
    notifications_enabled INTEGER DEFAULT 1,
    bedtime_reminder INTEGER DEFAULT 1,
    bedtime_reminder_offset INTEGER DEFAULT 30,
    wake_up_reminder INTEGER DEFAULT 1,
    data_retention_days INTEGER DEFAULT 730,
    allow_analytics INTEGER DEFAULT 1,
    biometric_auth_enabled INTEGER DEFAULT 0,
    theme TEXT DEFAULT 'auto',
    language TEXT DEFAULT 'en',
    temperature_unit TEXT DEFAULT 'celsius',
    ai_insights_enabled INTEGER DEFAULT 1,
    ai_response_style TEXT DEFAULT 'detailed',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sleep_data_date ON sleep_data(date);
  CREATE INDEX IF NOT EXISTS idx_sleep_data_created_at ON sleep_data(created_at);
`;
```

#### 2.1.2 Database Service Implementation
```typescript
// src/services/database/DatabaseService.ts
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SleepDataRecord, UserPreferences } from './schema';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('lunar.db');
      await this.db.execAsync(CREATE_TABLES);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  // Sleep data operations
  public async insertSleepData(data: Omit<SleepDataRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sleep_data (
          id, date, bed_time, sleep_time, wake_time, total_time_in_bed,
          total_sleep_time, sleep_efficiency, awake_duration, light_sleep_duration,
          deep_sleep_duration, rem_sleep_duration, average_heart_rate,
          resting_heart_rate, heart_rate_variability, data_source, data_quality,
          sleep_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, data.date, data.bedTime, data.sleepTime, data.wakeTime,
          data.totalTimeInBed, data.totalSleepTime, data.sleepEfficiency,
          data.awakeDuration, data.lightSleepDuration, data.deepSleepDuration,
          data.remSleepDuration, data.averageHeartRate, data.restingHeartRate,
          data.heartRateVariability, data.dataSource, data.dataQuality,
          data.sleepScore, now, now
        ]
      );
      return id;
    } catch (error) {
      console.error('Failed to insert sleep data:', error);
      throw new Error('Failed to save sleep data');
    }
  }

  public async getSleepDataByDateRange(startDate: string, endDate: string): Promise<SleepDataRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        `SELECT * FROM sleep_data 
         WHERE date >= ? AND date <= ? 
         ORDER BY date DESC`,
        [startDate, endDate]
      );

      return result.map(this.mapSleepDataRow);
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      throw new Error('Failed to retrieve sleep data');
    }
  }

  public async getLatestSleepData(): Promise<SleepDataRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        `SELECT * FROM sleep_data ORDER BY date DESC LIMIT 1`
      );

      return result ? this.mapSleepDataRow(result) : null;
    } catch (error) {
      console.error('Failed to fetch latest sleep data:', error);
      throw new Error('Failed to retrieve latest sleep data');
    }
  }

  // User preferences operations
  public async getUserPreferences(): Promise<UserPreferences | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        `SELECT * FROM user_preferences LIMIT 1`
      );

      return result ? this.mapUserPreferencesRow(result) : null;
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      throw new Error('Failed to retrieve user preferences');
    }
  }

  public async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.getUserPreferences();
    const now = new Date().toISOString();

    if (existing) {
      // Update existing preferences
      const updates = Object.keys(preferences)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => `${this.camelToSnakeCase(key)} = ?`);

      const values = Object.keys(preferences)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map(key => preferences[key as keyof UserPreferences]);

      await this.db.runAsync(
        `UPDATE user_preferences SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
        [...values, now, existing.id]
      );
    } else {
      // Insert new preferences
      const id = `prefs_${Date.now()}`;
      const defaultPrefs: UserPreferences = {
        id,
        targetSleepDuration: 480,
        targetBedtime: '22:00',
        targetWakeTime: '06:00',
        notificationsEnabled: true,
        bedtimeReminder: true,
        bedtimeReminderOffset: 30,
        wakeUpReminder: true,
        dataRetentionDays: 730,
        allowAnalytics: true,
        biometricAuthEnabled: false,
        theme: 'auto',
        language: 'en',
        temperatureUnit: 'celsius',
        aiInsightsEnabled: true,
        aiResponseStyle: 'detailed',
        createdAt: now,
        updatedAt: now,
        ...preferences,
      };

      await this.db.runAsync(
        `INSERT INTO user_preferences (
          id, target_sleep_duration, target_bedtime, target_wake_time,
          notifications_enabled, bedtime_reminder, bedtime_reminder_offset,
          wake_up_reminder, data_retention_days, allow_analytics,
          biometric_auth_enabled, theme, language, temperature_unit,
          ai_insights_enabled, ai_response_style, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          defaultPrefs.id, defaultPrefs.targetSleepDuration, defaultPrefs.targetBedtime,
          defaultPrefs.targetWakeTime, defaultPrefs.notificationsEnabled ? 1 : 0,
          defaultPrefs.bedtimeReminder ? 1 : 0, defaultPrefs.bedtimeReminderOffset,
          defaultPrefs.wakeUpReminder ? 1 : 0, defaultPrefs.dataRetentionDays,
          defaultPrefs.allowAnalytics ? 1 : 0, defaultPrefs.biometricAuthEnabled ? 1 : 0,
          defaultPrefs.theme, defaultPrefs.language, defaultPrefs.temperatureUnit,
          defaultPrefs.aiInsightsEnabled ? 1 : 0, defaultPrefs.aiResponseStyle,
          defaultPrefs.createdAt, defaultPrefs.updatedAt
        ]
      );
    }
  }

  // Utility methods
  private mapSleepDataRow(row: any): SleepDataRecord {
    return {
      id: row.id,
      date: row.date,
      bedTime: row.bed_time,
      sleepTime: row.sleep_time,
      wakeTime: row.wake_time,
      totalTimeInBed: row.total_time_in_bed,
      totalSleepTime: row.total_sleep_time,
      sleepEfficiency: row.sleep_efficiency,
      awakeDuration: row.awake_duration,
      lightSleepDuration: row.light_sleep_duration,
      deepSleepDuration: row.deep_sleep_duration,
      remSleepDuration: row.rem_sleep_duration,
      averageHeartRate: row.average_heart_rate,
      restingHeartRate: row.resting_heart_rate,
      heartRateVariability: row.heart_rate_variability,
      dataSource: row.data_source as SleepDataRecord['dataSource'],
      dataQuality: row.data_quality as SleepDataRecord['dataQuality'],
      sleepScore: row.sleep_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapUserPreferencesRow(row: any): UserPreferences {
    return {
      id: row.id,
      targetSleepDuration: row.target_sleep_duration,
      targetBedtime: row.target_bedtime,
      targetWakeTime: row.target_wake_time,
      notificationsEnabled: Boolean(row.notifications_enabled),
      bedtimeReminder: Boolean(row.bedtime_reminder),
      bedtimeReminderOffset: row.bedtime_reminder_offset,
      wakeUpReminder: Boolean(row.wake_up_reminder),
      dataRetentionDays: row.data_retention_days,
      allowAnalytics: Boolean(row.allow_analytics),
      biometricAuthEnabled: Boolean(row.biometric_auth_enabled),
      theme: row.theme,
      language: row.language,
      temperatureUnit: row.temperature_unit,
      aiInsightsEnabled: Boolean(row.ai_insights_enabled),
      aiResponseStyle: row.ai_response_style,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Data maintenance
  public async cleanupOldData(retentionDays: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    try {
      await this.db.runAsync(
        `DELETE FROM sleep_data WHERE date < ?`,
        [cutoffDateStr]
      );
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  public async exportData(): Promise<{ sleepData: SleepDataRecord[]; preferences: UserPreferences | null }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const sleepData = await this.db.getAllAsync(`SELECT * FROM sleep_data ORDER BY date`);
      const preferences = await this.getUserPreferences();

      return {
        sleepData: sleepData.map(this.mapSleepDataRow),
        preferences,
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
```

### 2.2 HealthKit Integration Service

#### 2.2.1 HealthKit Service Implementation
```typescript
// src/services/health/HealthKitService.ts
import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  SleepAnalysis,
  HealthValue,
} from 'react-native-health';
import { SleepDataRecord } from '../database/schema';

export interface HealthKitPermissions {
  read: string[];
  write: string[];
}

export class HealthKitService {
  private static instance: HealthKitService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('HealthKit is only available on iOS');
      return false;
    }

    return new Promise((resolve) => {
      const permissions: HealthKitPermissions = {
        read: [
          AppleHealthKit.Constants.Permissions.Sleep,
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
          AppleHealthKit.Constants.Permissions.HeartRate,
          AppleHealthKit.Constants.Permissions.RestingHeartRate,
          AppleHealthKit.Constants.Permissions.HeartRateVariability,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
        ],
      };

      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('HealthKit initialization failed:', error);
          resolve(false);
        } else {
          this.isInitialized = true;
          console.log('HealthKit initialized successfully');
          resolve(true);
        }
      });
    });
  }

  public async requestPermissions(): Promise<boolean> {
    if (!this.isInitialized) {
      return await this.initialize();
    }
    return true;
  }

  public async getSleepData(startDate: Date, endDate: Date): Promise<SleepDataRecord[]> {
    if (!this.isInitialized || Platform.OS !== 'ios') {
      throw new Error('HealthKit not available or not initialized');
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
      };

      AppleHealthKit.getSleepSamples(options, (callbackError: string, results: SleepAnalysis[]) => {
        if (callbackError) {
          console.error('Failed to fetch sleep data:', callbackError);
          reject(new Error('Failed to fetch sleep data from HealthKit'));
          return;
        }

        try {
          const sleepRecords = this.processSleepAnalysis(results);
          resolve(sleepRecords);
        } catch (error) {
          console.error('Failed to process sleep data:', error);
          reject(new Error('Failed to process sleep data'));
        }
      });
    });
  }

  private processSleepAnalysis(sleepAnalysis: SleepAnalysis[]): SleepDataRecord[] {
    // Group sleep analysis by date
    const sleepByDate: Record<string, SleepAnalysis[]> = {};
    
    sleepAnalysis.forEach((analysis) => {
      const date = new Date(analysis.startDate).toISOString().split('T')[0];
      if (!sleepByDate[date]) {
        sleepByDate[date] = [];
      }
      sleepByDate[date].push(analysis);
    });

    // Convert grouped data to SleepDataRecord format
    const sleepRecords: SleepDataRecord[] = [];

    Object.entries(sleepByDate).forEach(([date, analyses]) => {
      const sleepRecord = this.createSleepRecord(date, analyses);
      if (sleepRecord) {
        sleepRecords.push(sleepRecord);
      }
    });

    return sleepRecords.sort((a, b) => b.date.localeCompare(a.date));
  }

  private createSleepRecord(date: string, analyses: SleepAnalysis[]): SleepDataRecord | null {
    if (analyses.length === 0) return null;

    // Sort analyses by start time
    const sortedAnalyses = analyses.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Find bed time (first inBed or asleep time)
    const bedTimeAnalysis = sortedAnalyses.find(a => 
      a.value === 'INBED' || a.value === 'ASLEEP'
    );
    
    // Find wake time (last analysis end time)
    const lastAnalysis = sortedAnalyses[sortedAnalyses.length - 1];
    
    if (!bedTimeAnalysis || !lastAnalysis) return null;

    const bedTime = new Date(bedTimeAnalysis.startDate);
    const wakeTime = new Date(lastAnalysis.endDate);

    // Calculate sleep stages durations
    let awakeDuration = 0;
    let lightSleepDuration = 0;
    let deepSleepDuration = 0;
    let remSleepDuration = 0;
    let totalSleepTime = 0;

    sortedAnalyses.forEach((analysis) => {
      const duration = (new Date(analysis.endDate).getTime() - new Date(analysis.startDate).getTime()) / (1000 * 60);
      
      switch (analysis.value) {
        case 'AWAKE':
          awakeDuration += duration;
          break;
        case 'ASLEEP':
          // Generic sleep time - if no specific stages, count as light sleep
          lightSleepDuration += duration;
          totalSleepTime += duration;
          break;
        case 'CORE': // Light sleep in HealthKit terminology
          lightSleepDuration += duration;
          totalSleepTime += duration;
          break;
        case 'DEEP':
          deepSleepDuration += duration;
          totalSleepTime += duration;
          break;
        case 'REM':
          remSleepDuration += duration;
          totalSleepTime += duration;
          break;
      }
    });

    const totalTimeInBed = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);
    const sleepEfficiency = totalTimeInBed > 0 ? (totalSleepTime / totalTimeInBed) * 100 : 0;

    // Calculate sleep score based on multiple factors
    const sleepScore = this.calculateSleepScore({
      totalSleepTime,
      sleepEfficiency,
      deepSleepDuration,
      remSleepDuration,
      awakeDuration,
    });

    const now = new Date().toISOString();

    return {
      id: `hk_${date}_${Date.now()}`,
      date,
      bedTime: bedTime.toISOString(),
      sleepTime: sortedAnalyses.find(a => a.value === 'ASLEEP')?.startDate || bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      totalTimeInBed: Math.round(totalTimeInBed),
      totalSleepTime: Math.round(totalSleepTime),
      sleepEfficiency: Math.round(sleepEfficiency * 10) / 10,
      awakeDuration: Math.round(awakeDuration),
      lightSleepDuration: Math.round(lightSleepDuration),
      deepSleepDuration: Math.round(deepSleepDuration),
      remSleepDuration: Math.round(remSleepDuration),
      dataSource: 'Apple Watch', // Assume Apple Watch if detailed stages available
      dataQuality: this.assessDataQuality(analyses),
      sleepScore,
      createdAt: now,
      updatedAt: now,
    };
  }

  private calculateSleepScore(data: {
    totalSleepTime: number;
    sleepEfficiency: number;
    deepSleepDuration: number;
    remSleepDuration: number;
    awakeDuration: number;
  }): number {
    let score = 0;

    // Sleep duration score (40 points max)
    const targetSleep = 8 * 60; // 8 hours in minutes
    const durationScore = Math.min(40, (data.totalSleepTime / targetSleep) * 40);
    score += durationScore;

    // Sleep efficiency score (30 points max)
    const efficiencyScore = Math.min(30, (data.sleepEfficiency / 100) * 30);
    score += efficiencyScore;

    // Deep sleep score (15 points max)
    const targetDeepSleep = data.totalSleepTime * 0.15; // 15% of total sleep
    const deepSleepScore = Math.min(15, (data.deepSleepDuration / targetDeepSleep) * 15);
    score += deepSleepScore;

    // REM sleep score (15 points max)
    const targetRemSleep = data.totalSleepTime * 0.25; // 25% of total sleep
    const remSleepScore = Math.min(15, (data.remSleepDuration / targetRemSleep) * 15);
    score += remSleepScore;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private assessDataQuality(analyses: SleepAnalysis[]): 'High' | 'Medium' | 'Low' {
    // High quality: Has detailed sleep stages (Core, Deep, REM)
    const hasDetailedStages = analyses.some(a => 
      ['CORE', 'DEEP', 'REM'].includes(a.value)
    );
    
    // Medium quality: Has basic sleep/wake data
    const hasBasicData = analyses.some(a => 
      ['ASLEEP', 'INBED', 'AWAKE'].includes(a.value)
    );

    if (hasDetailedStages) return 'High';
    if (hasBasicData) return 'Medium';
    return 'Low';
  }

  public async getHeartRateData(startDate: Date, endDate: Date): Promise<HealthValue[]> {
    if (!this.isInitialized || Platform.OS !== 'ios') {
      return [];
    }

    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
      };

      AppleHealthKit.getHeartRateSamples(options, (callbackError: string, results: HealthValue[]) => {
        if (callbackError) {
          console.warn('Failed to fetch heart rate data:', callbackError);
          resolve([]);
          return;
        }

        resolve(results || []);
      });
    });
  }

  public async getRestingHeartRate(date: Date): Promise<number | null> {
    if (!this.isInitialized || Platform.OS !== 'ios') {
      return null;
    }

    return new Promise((resolve) => {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getRestingHeartRate(options, (callbackError: string, results: HealthValue[]) => {
        if (callbackError || !results || results.length === 0) {
          resolve(null);
          return;
        }

        // Get the most recent resting heart rate for the day
        const latest = results[0];
        resolve(latest.value);
      });
    });
  }

  public async syncRecentData(days: number = 7): Promise<SleepDataRecord[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const sleepData = await this.getSleepData(startDate, endDate);
      
      // Enhance sleep data with heart rate information
      for (const record of sleepData) {
        const recordDate = new Date(record.date);
        
        // Get resting heart rate for the day
        const restingHR = await this.getRestingHeartRate(recordDate);
        if (restingHR) {
          record.restingHeartRate = restingHR;
        }

        // Get heart rate during sleep period
        if (record.sleepTime && record.wakeTime) {
          const sleepStart = new Date(record.sleepTime);
          const sleepEnd = new Date(record.wakeTime);
          const heartRateData = await this.getHeartRateData(sleepStart, sleepEnd);
          
          if (heartRateData.length > 0) {
            const avgHR = heartRateData.reduce((sum, hr) => sum + hr.value, 0) / heartRateData.length;
            record.averageHeartRate = Math.round(avgHR);
          }
        }
      }

      return sleepData;
    } catch (error) {
      console.error('Failed to sync recent data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const healthKitService = HealthKitService.getInstance();
```

### 2.3 AI Service Integration

#### 2.3.1 OpenAI Service Implementation
```typescript
// src/services/ai/OpenAIService.ts
import { SleepDataRecord, UserPreferences } from '../database/schema';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    sleepData?: Partial<SleepDataRecord>;
    context?: string;
  };
}

export interface AIInsight {
  type: 'recommendation' | 'observation' | 'warning' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'sleep_quality' | 'sleep_timing' | 'sleep_duration' | 'lifestyle';
}

export interface ConversationContext {
  recentSleepData: SleepDataRecord[];
  userPreferences: UserPreferences;
  currentTrends: {
    averageSleepDuration: number;
    averageSleepScore: number;
    sleepEfficiencyTrend: 'improving' | 'declining' | 'stable';
    consistencyScore: number;
  };
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly maxRequestsPerMinute = 20;
  
  private constructor() {
    // In production, this would come from secure environment variables
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
      return false;
    }
    return true;
  }

  private async rateLimitCheck(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < 60000) { // Within the last minute
      if (this.requestCount >= this.maxRequestsPerMinute) {
        const waitTime = 60000 - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
      }
    } else {
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }

  public async generateResponse(
    message: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getOfflineResponse(message);
    }

    try {
      await this.rateLimitCheck();

      const systemPrompt = this.buildSystemPrompt(context);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({ // Limit history to last 10 messages
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText);
        return this.getOfflineResponse(message);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      return this.getOfflineResponse(message);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const { recentSleepData, userPreferences, currentTrends } = context;
    const latestSleep = recentSleepData[0];

    return `You are Lunar, an AI sleep coach and analyst. You provide personalized, evidence-based sleep advice while maintaining a friendly and encouraging tone.

CONTEXT:
User's Recent Sleep Data:
- Average sleep duration: ${currentTrends.averageSleepDuration} minutes (${Math.round(currentTrends.averageSleepDuration / 60 * 10) / 10} hours)
- Average sleep score: ${currentTrends.averageSleepScore}/100
- Sleep efficiency trend: ${currentTrends.sleepEfficiencyTrend}
- Sleep consistency: ${currentTrends.consistencyScore}% consistent

User Preferences:
- Target sleep: ${userPreferences.targetSleepDuration} minutes (${Math.round(userPreferences.targetSleepDuration / 60 * 10) / 10} hours)
- Target bedtime: ${userPreferences.targetBedtime}
- Target wake time: ${userPreferences.targetWakeTime}
- Response style: ${userPreferences.aiResponseStyle}

${latestSleep ? `Latest Sleep (${latestSleep.date}):
- Total sleep: ${latestSleep.totalSleepTime} minutes
- Sleep efficiency: ${latestSleep.sleepEfficiency}%
- Sleep score: ${latestSleep.sleepScore}/100
- Bed time: ${new Date(latestSleep.bedTime).toLocaleTimeString()}
- Wake time: ${new Date(latestSleep.wakeTime).toLocaleTimeString()}` : 'No recent sleep data available'}

GUIDELINES:
1. Be conversational, supportive, and encouraging
2. Provide specific, actionable advice based on the user's data
3. Reference their actual sleep patterns when relevant
4. Keep responses ${userPreferences.aiResponseStyle === 'concise' ? 'concise and to-the-point' : 'detailed but not overwhelming'}
5. Focus on evidence-based sleep science
6. Acknowledge improvements and celebrate progress
7. Be empathetic about sleep challenges
8. Suggest gradual, sustainable changes
9. Never provide medical advice or diagnose sleep disorders
10. If asked about serious sleep issues, recommend consulting a healthcare provider

Remember: You're a supportive sleep coach, not a medical professional. Focus on lifestyle improvements and sleep hygiene.`;
  }

  private getOfflineResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based responses for offline mode
    if (lowerMessage.includes('score') || lowerMessage.includes('rating')) {
      return "I'd love to analyze your sleep score! However, I'm currently offline. Your sleep score is calculated based on sleep duration, efficiency, and sleep stages. Generally, scores above 80 indicate good sleep quality.";
    }
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return "Here are some evidence-based tips to improve your sleep:\n\n• Maintain a consistent sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool (65-68°F)\n• Limit screens 1 hour before bed\n• Get natural light exposure in the morning\n• Avoid caffeine after 2 PM";
    }
    
    if (lowerMessage.includes('wake') || lowerMessage.includes('tired')) {
      return "Feeling tired after waking can have several causes:\n\n• Waking during deep sleep phases\n• Insufficient sleep duration\n• Poor sleep quality\n• Sleep disorders\n\nTry maintaining consistent wake times and ensuring 7-9 hours of sleep. If the issue persists, consider consulting a healthcare provider.";
    }
    
    if (lowerMessage.includes('bedtime') || lowerMessage.includes('when')) {
      return "Your optimal bedtime depends on when you need to wake up and how much sleep you need. Most adults need 7-9 hours of sleep. Count backwards from your wake time to find your ideal bedtime. Consistency is key!";
    }
    
    return "I'm currently offline, but I'm here to help with your sleep questions! Try asking about sleep scores, improvement tips, bedtime recommendations, or any sleep-related concerns you might have.";
  }

  public async generateInsights(
    recentSleepData: SleepDataRecord[],
    userPreferences: UserPreferences
  ): Promise<AIInsight[]> {
    if (recentSleepData.length === 0) {
      return [];
    }

    const insights: AIInsight[] = [];
    const latest = recentSleepData[0];
    const average = this.calculateAverages(recentSleepData);

    // Sleep duration insights
    if (latest.totalSleepTime < userPreferences.targetSleepDuration - 60) {
      insights.push({
        type: 'recommendation',
        title: 'Sleep Duration Below Target',
        description: `You got ${Math.round(latest.totalSleepTime / 60 * 10) / 10} hours of sleep, which is below your ${Math.round(userPreferences.targetSleepDuration / 60 * 10) / 10}-hour target. Consider adjusting your bedtime routine.`,
        actionable: true,
        priority: 'medium',
        category: 'sleep_duration',
      });
    }

    // Sleep efficiency insights
    if (latest.sleepEfficiency < 85) {
      insights.push({
        type: 'recommendation',
        title: 'Sleep Efficiency Could Improve',
        description: `Your sleep efficiency was ${latest.sleepEfficiency}%. Aim for 85% or higher by reducing time spent awake in bed.`,
        actionable: true,
        priority: 'medium',
        category: 'sleep_quality',
      });
    }

    // Consistency insights
    const consistencyScore = this.calculateConsistency(recentSleepData);
    if (consistencyScore < 70) {
      insights.push({
        type: 'recommendation',
        title: 'Sleep Schedule Consistency',
        description: 'Your sleep times vary significantly. A consistent sleep schedule can improve sleep quality and help you feel more rested.',
        actionable: true,
        priority: 'high',
        category: 'sleep_timing',
      });
    }

    // Achievement insights
    if (latest.sleepScore >= 90) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Sleep!',
        description: `You achieved a sleep score of ${latest.sleepScore}! Keep up the great sleep habits.`,
        actionable: false,
        priority: 'low',
        category: 'sleep_quality',
      });
    }

    return insights;
  }

  private calculateAverages(sleepData: SleepDataRecord[]): {
    avgDuration: number;
    avgEfficiency: number;
    avgScore: number;
  } {
    const validData = sleepData.filter(d => d.totalSleepTime > 0);
    
    if (validData.length === 0) {
      return { avgDuration: 0, avgEfficiency: 0, avgScore: 0 };
    }

    const totalDuration = validData.reduce((sum, d) => sum + d.totalSleepTime, 0);
    const totalEfficiency = validData.reduce((sum, d) => sum + (d.sleepEfficiency || 0), 0);
    const totalScore = validData.reduce((sum, d) => sum + (d.sleepScore || 0), 0);

    return {
      avgDuration: totalDuration / validData.length,
      avgEfficiency: totalEfficiency / validData.length,
      avgScore: totalScore / validData.length,
    };
  }

  private calculateConsistency(sleepData: SleepDataRecord[]): number {
    if (sleepData.length < 2) return 100;

    const bedtimes = sleepData
      .filter(d => d.bedTime)
      .map(d => {
        const time = new Date(d.bedTime);
        return time.getHours() * 60 + time.getMinutes();
      });

    if (bedtimes.length < 2) return 100;

    const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency percentage (lower deviation = higher consistency)
    return Math.max(0, 100 - (standardDeviation / 60) * 10);
  }

  public async saveConversation(messages: ChatMessage[]): Promise<void> {
    // In a production app, this would save to local database
    // For now, we'll use AsyncStorage for simplicity
    try {
      const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  public async loadConversation(): Promise<ChatMessage[]> {
    try {
      const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const saved = await AsyncStorage.getItem('chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return [];
    }
  }
}

// Export singleton instance
export const openAIService = OpenAIService.getInstance();
```

## 3. Component Development Guidelines

### 3.1 UI Component Architecture

#### 3.1.1 Theme Provider Setup
```typescript
// src/components/providers/GluestackThemeProvider.tsx
import { GluestackUIProvider } from '@gluestack-ui/gluestack-ui-provider';
import { config } from '@gluestack-ui/config';
import React from 'react';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function GluestackThemeProvider({ children }: ThemeProviderProps) {
  const colorMode = useColorScheme() ?? 'light';

  return (
    <GluestackUIProvider config={config} colorMode={colorMode}>
      {children}
    </GluestackUIProvider>
  );
}
```

#### 3.1.2 Base Components
```typescript
// src/components/ui/Container.tsx
import React from 'react';
import { Box, ScrollView } from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: number;
  backgroundColor?: string;
}

export function Container({ 
  children, 
  scrollable = false, 
  padding = 16,
  backgroundColor = '$background'
}: ContainerProps) {
  const insets = useSafeAreaInsets();

  const containerProps = {
    flex: 1,
    backgroundColor,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: padding,
    paddingRight: padding,
  };

  if (scrollable) {
    return (
      <ScrollView
        {...containerProps}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <Box {...containerProps}>{children}</Box>;
}

// src/components/ui/SleepScore.tsx
import React from 'react';
import { Box, Text, Progress, ProgressFilledTrack } from '@gluestack-ui/themed';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay 
} from 'react-native-reanimated';

interface SleepScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
}

export function SleepScore({ 
  score, 
  size = 'medium', 
  showLabel = true, 
  animated = true 
}: SleepScoreProps) {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animatedValue.value = withDelay(300, withSpring(score, {
        damping: 15,
        stiffness: 100,
      }));
    } else {
      animatedValue.value = score;
    }
  }, [score, animated, animatedValue]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '$success500';
    if (score >= 60) return '$warning500';
    return '$error500';
  };

  const getSizeProps = (size: string) => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80, textSize: '$lg' };
      case 'large':
        return { width: 160, height: 160, textSize: '$4xl' };
      default:
        return { width: 120, height: 120, textSize: '$2xl' };
    }
  };

  const sizeProps = getSizeProps(size);
  const scoreColor = getScoreColor(score);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: withSpring(animatedValue.value > 0 ? 1 : 0),
  }));

  return (
    <Box alignItems="center">
      <Box
        width={sizeProps.width}
        height={sizeProps.height}
        borderRadius="$full"
        justifyContent="center"
        alignItems="center"
        position="relative"
      >
        {/* Background circle */}
        <Box
          position="absolute"
          width="$full"
          height="$full"
          borderRadius="$full"
          borderWidth={8}
          borderColor="$borderLight200"
        />
        
        {/* Progress circle */}
        <Progress
          value={score}
          size="xl"
          width={sizeProps.width}
          height={sizeProps.height}
        >
          <ProgressFilledTrack backgroundColor={scoreColor} />
        </Progress>

        {/* Score text */}
        <Animated.View style={[{ position: 'absolute' }, animatedTextStyle]}>
          <Text 
            fontSize={sizeProps.textSize} 
            fontWeight="$bold" 
            color={scoreColor}
          >
            {Math.round(score)}
          </Text>
        </Animated.View>
      </Box>
      
      {showLabel && (
        <Text 
          fontSize="$sm" 
          color="$textLight500" 
          marginTop="$2"
        >
          Sleep Score
        </Text>
      )}
    </Box>
  );
}

// src/components/ui/MetricCard.tsx
import React from 'react';
import { Box, Text, HStack, VStack } from '@gluestack-ui/themed';
import { IconSymbol } from './IconSymbol';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  backgroundColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  backgroundColor = '$backgroundCard'
}: MetricCardProps) {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return '$success500';
      case 'down': return '$error500';
      default: return '$textLight500';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return 'arrow.up';
      case 'down': return 'arrow.down';
      default: return 'minus';
    }
  };

  return (
    <Box
      backgroundColor={backgroundColor}
      borderRadius="$lg"
      padding="$4"
      shadowColor="$black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        <VStack flex={1}>
          <Text fontSize="$sm" color="$textLight500" marginBottom="$1">
            {title}
          </Text>
          <Text fontSize="$2xl" fontWeight="$bold" color="$text">
            {value}
          </Text>
          {subtitle && (
            <Text fontSize="$xs" color="$textLight400">
              {subtitle}
            </Text>
          )}
        </VStack>
        
        <VStack alignItems="flex-end">
          {icon && (
            <IconSymbol 
              name={icon} 
              size={24} 
              color="$primary500" 
              marginBottom="$2"
            />
          )}
          {trend && trendValue && (
            <HStack alignItems="center">
              <IconSymbol
                name={getTrendIcon(trend)}
                size={12}
                color={getTrendColor(trend)}
                marginRight="$1"
              />
              <Text 
                fontSize="$xs" 
                color={getTrendColor(trend)}
                fontWeight="$semibold"
              >
                {trendValue}
              </Text>
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}
```

### 3.2 Chart Components

#### 3.2.1 Sleep Phase Chart
```typescript
// src/components/charts/SleepPhaseChart.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';
import { BarChart } from 'react-native-chart-kit';
import { SleepDataRecord } from '@/services/database/schema';

interface SleepPhaseChartProps {
  sleepData: SleepDataRecord;
  height?: number;
}

export function SleepPhaseChart({ sleepData, height = 200 }: SleepPhaseChartProps) {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: ['Awake', 'Light', 'Deep', 'REM'],
    datasets: [{
      data: [
        sleepData.awakeDuration || 0,
        sleepData.lightSleepDuration || 0,
        sleepData.deepSleepDuration || 0,
        sleepData.remSleepDuration || 0,
      ],
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#1a1a1a',
    color: (opacity = 1) => `rgba(126, 211, 33, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fill: '#888',
    },
  };

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'Awake': return '$error500';
      case 'Light': return '$info500';
      case 'Deep': return '$primary500';
      case 'REM': return '$warning500';
      default: return '$textLight500';
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <VStack space="md">
      <Text fontSize="$lg" fontWeight="$semibold" color="$text">
        Sleep Phases
      </Text>
      
      <Box alignItems="center">
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={height}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars
          fromZero
        />
      </Box>

      {/* Legend with detailed information */}
      <VStack space="sm">
        {chartData.labels.map((label, index) => {
          const duration = chartData.datasets[0].data[index];
          const percentage = sleepData.totalSleepTime > 0 
            ? ((duration / sleepData.totalSleepTime) * 100).toFixed(1)
            : '0';

          return (
            <HStack 
              key={label} 
              justifyContent="space-between" 
              alignItems="center"
              paddingHorizontal="$2"
            >
              <HStack alignItems="center" space="sm">
                <Box
                  width="$3"
                  height="$3"
                  borderRadius="$full"
                  backgroundColor={getPhaseColor(label)}
                />
                <Text fontSize="$sm" color="$text">
                  {label}
                </Text>
              </HStack>
              
              <HStack alignItems="center" space="md">
                <Text fontSize="$sm" color="$textLight500">
                  {formatDuration(duration)}
                </Text>
                <Text 
                  fontSize="$sm" 
                  color="$textLight400" 
                  minWidth="$12"
                  textAlign="right"
                >
                  {percentage}%
                </Text>
              </HStack>
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );
}
```

### 3.3 Performance Optimization Patterns

#### 3.3.1 Memoization and Optimization
```typescript
// src/hooks/useSleepData.ts
import { useState, useEffect, useMemo } from 'react';
import { databaseService } from '@/services/database/DatabaseService';
import { SleepDataRecord } from '@/services/database/schema';

export function useSleepData(days: number = 7) {
  const [sleepData, setSleepData] = useState<SleepDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        setLoading(true);
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        
        const data = await databaseService.getSleepDataByDateRange(startDate, endDate);
        setSleepData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch sleep data:', err);
        setError('Failed to load sleep data');
      } finally {
        setLoading(false);
      }
    };

    fetchSleepData();
  }, [days]);

  // Memoized calculations
  const analytics = useMemo(() => {
    if (sleepData.length === 0) {
      return {
        averageDuration: 0,
        averageScore: 0,
        averageEfficiency: 0,
        consistency: 0,
        trend: 'stable' as const,
      };
    }

    const validData = sleepData.filter(d => d.totalSleepTime > 0);
    
    const avgDuration = validData.reduce((sum, d) => sum + d.totalSleepTime, 0) / validData.length;
    const avgScore = validData.reduce((sum, d) => sum + (d.sleepScore || 0), 0) / validData.length;
    const avgEfficiency = validData.reduce((sum, d) => sum + (d.sleepEfficiency || 0), 0) / validData.length;

    // Calculate trend (comparing first half to second half)
    const midpoint = Math.floor(validData.length / 2);
    const firstHalf = validData.slice(0, midpoint);
    const secondHalf = validData.slice(midpoint);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((sum, d) => sum + (d.sleepScore || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + (d.sleepScore || 0), 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) trend = 'improving';
      else if (secondAvg < firstAvg - 5) trend = 'declining';
    }

    // Calculate consistency (standard deviation of bedtimes)
    const bedtimes = validData
      .filter(d => d.bedTime)
      .map(d => {
        const time = new Date(d.bedTime);
        return time.getHours() * 60 + time.getMinutes();
      });

    let consistency = 100;
    if (bedtimes.length > 1) {
      const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
      const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
      const standardDeviation = Math.sqrt(variance);
      consistency = Math.max(0, 100 - (standardDeviation / 30));
    }

    return {
      averageDuration: Math.round(avgDuration),
      averageScore: Math.round(avgScore),
      averageEfficiency: Math.round(avgEfficiency * 10) / 10,
      consistency: Math.round(consistency),
      trend,
    };
  }, [sleepData]);

  const refetch = async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    try {
      setLoading(true);
      const data = await databaseService.getSleepDataByDateRange(startDate, endDate);
      setSleepData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refetch sleep data:', err);
      setError('Failed to refresh sleep data');
    } finally {
      setLoading(false);
    }
  };

  return {
    sleepData,
    analytics,
    loading,
    error,
    refetch,
  };
}

// src/hooks/usePerformanceMonitoring.ts
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics (in production, send to analytics service)
    if (renderTime > 16) { // Warn if render takes longer than one frame (60fps)
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }

    // Track metrics for debugging
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
    };

    // In production, send to analytics service
    if (__DEV__) {
      console.log('Performance:', metrics);
    }
  });
}
```

## 4. Testing Implementation

### 4.1 Testing Framework Setup

#### 4.1.1 Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '@testing-library/jest-native/extend-expect',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/?(*.)(spec|test).(js|jsx|ts|tsx)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// src/setupTests.ts
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn(() => Promise.resolve()),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
  })),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-health', () => ({
  initHealthKit: jest.fn((permissions, callback) => callback(null)),
  getSleepSamples: jest.fn((options, callback) => callback(null, [])),
  Constants: {
    Permissions: {
      Sleep: 'Sleep',
      SleepAnalysis: 'SleepAnalysis',
      HeartRate: 'HeartRate',
    },
  },
}));

// Mock AsyncStorage
import mockAsyncStorage from '@react-native-async-storage/async-storage/mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Global test timeout
jest.setTimeout(10000);
```

#### 4.1.2 Unit Tests Examples
```typescript
// src/services/database/__tests__/DatabaseService.test.ts
import { DatabaseService } from '../DatabaseService';
import { SleepDataRecord } from '../schema';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(async () => {
    databaseService = DatabaseService.getInstance();
    await databaseService.initialize();
  });

  describe('insertSleepData', () => {
    it('should insert sleep data successfully', async () => {
      const mockSleepData: Omit<SleepDataRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: '2025-09-08',
        bedTime: '2025-09-08T22:00:00.000Z',
        sleepTime: '2025-09-08T22:30:00.000Z',
        wakeTime: '2025-09-09T06:00:00.000Z',
        totalTimeInBed: 480,
        totalSleepTime: 450,
        sleepEfficiency: 93.75,
        dataSource: 'iPhone',
        dataQuality: 'High',
        sleepScore: 85,
      };

      const id = await databaseService.insertSleepData(mockSleepData);
      expect(id).toMatch(/^sleep_\d+_[a-z0-9]+$/);
    });

    it('should handle insert errors gracefully', async () => {
      const invalidSleepData = {} as any;

      await expect(
        databaseService.insertSleepData(invalidSleepData)
      ).rejects.toThrow('Failed to save sleep data');
    });
  });

  describe('getSleepDataByDateRange', () => {
    beforeEach(async () => {
      // Insert test data
      const testData: Omit<SleepDataRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: '2025-09-08',
        bedTime: '2025-09-08T22:00:00.000Z',
        sleepTime: '2025-09-08T22:30:00.000Z',
        wakeTime: '2025-09-09T06:00:00.000Z',
        totalTimeInBed: 480,
        totalSleepTime: 450,
        sleepEfficiency: 93.75,
        dataSource: 'iPhone',
        dataQuality: 'High',
        sleepScore: 85,
      };

      await databaseService.insertSleepData(testData);
    });

    it('should retrieve sleep data within date range', async () => {
      const data = await databaseService.getSleepDataByDateRange(
        '2025-09-01',
        '2025-09-30'
      );

      expect(data).toHaveLength(1);
      expect(data[0].date).toBe('2025-09-08');
      expect(data[0].sleepScore).toBe(85);
    });

    it('should return empty array for date range with no data', async () => {
      const data = await databaseService.getSleepDataByDateRange(
        '2025-01-01',
        '2025-01-31'
      );

      expect(data).toHaveLength(0);
    });
  });
});

// src/components/ui/__tests__/SleepScore.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { SleepScore } from '../SleepScore';
import { GluestackThemeProvider } from '../../providers/GluestackThemeProvider';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <GluestackThemeProvider>
      {component}
    </GluestackThemeProvider>
  );
};

describe('SleepScore', () => {
  it('renders correctly with score', () => {
    const { getByText } = renderWithTheme(
      <SleepScore score={85} />
    );

    expect(getByText('85')).toBeTruthy();
    expect(getByText('Sleep Score')).toBeTruthy();
  });

  it('renders without label when showLabel is false', () => {
    const { getByText, queryByText } = renderWithTheme(
      <SleepScore score={85} showLabel={false} />
    );

    expect(getByText('85')).toBeTruthy();
    expect(queryByText('Sleep Score')).toBeNull();
  });

  it('applies correct color based on score', () => {
    const { rerender, getByText } = renderWithTheme(
      <SleepScore score={90} />
    );

    // High score should use success color
    let scoreElement = getByText('90');
    expect(scoreElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: expect.stringMatching(/success/) })
      ])
    );

    // Medium score should use warning color
    rerender(
      <GluestackThemeProvider>
        <SleepScore score={65} />
      </GluestackThemeProvider>
    );
    scoreElement = getByText('65');
    expect(scoreElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: expect.stringMatching(/warning/) })
      ])
    );

    // Low score should use error color
    rerender(
      <GluestackThemeProvider>
        <SleepScore score={45} />
      </GluestackThemeProvider>
    );
    scoreElement = getByText('45');
    expect(scoreElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: expect.stringMatching(/error/) })
      ])
    );
  });

  it('handles different sizes correctly', () => {
    const { rerender, getByText } = renderWithTheme(
      <SleepScore score={85} size="small" />
    );

    let scoreElement = getByText('85');
    expect(scoreElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: expect.any(Number) })
      ])
    );

    rerender(
      <GluestackThemeProvider>
        <SleepScore score={85} size="large" />
      </GluestackThemeProvider>
    );

    scoreElement = getByText('85');
    expect(scoreElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: expect.any(Number) })
      ])
    );
  });
});
```

### 4.2 Integration Tests

#### 4.2.1 End-to-End Test Setup with Detox
```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Lunar.app',
      build: 'xcodebuild -workspace ios/Lunar.xcworkspace -scheme Lunar -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_34'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};

// e2e/jest.config.js
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
```

#### 4.2.2 E2E Test Examples
```javascript
// e2e/onboarding.e2e.js
describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete onboarding flow successfully', async () => {
    // Welcome screen
    await expect(element(by.text('Welcome to Lunar'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    // Health permissions screen
    await expect(element(by.text('Health Data Access'))).toBeVisible();
    await element(by.text('Grant Access')).tap();

    // Sleep goals screen
    await expect(element(by.text('Set Your Sleep Goals'))).toBeVisible();
    
    // Set target sleep duration
    await element(by.id('sleep-duration-slider')).swipe('right', 'slow');
    await element(by.text('Next')).tap();

    // Set bedtime
    await element(by.id('bedtime-picker')).tap();
    await element(by.text('10:00 PM')).tap();
    await element(by.text('Next')).tap();

    // Set wake time
    await element(by.id('wake-time-picker')).tap();
    await element(by.text('6:00 AM')).tap();
    await element(by.text('Complete Setup')).tap();

    // Should navigate to dashboard
    await expect(element(by.text('Dashboard'))).toBeVisible();
    await expect(element(by.id('sleep-score'))).toBeVisible();
  });

  it('should handle back navigation during onboarding', async () => {
    await expect(element(by.text('Welcome to Lunar'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    await expect(element(by.text('Health Data Access'))).toBeVisible();
    await element(by.text('Grant Access')).tap();

    await expect(element(by.text('Set Your Sleep Goals'))).toBeVisible();
    
    // Navigate back
    await element(by.id('back-button')).tap();
    await expect(element(by.text('Health Data Access'))).toBeVisible();

    // Navigate back again
    await element(by.id('back-button')).tap();
    await expect(element(by.text('Welcome to Lunar'))).toBeVisible();
  });
});

// e2e/dashboard.e2e.js
describe('Dashboard', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    // Complete onboarding first
    await element(by.text('Skip Onboarding')).tap(); // For test purposes
  });

  it('should display sleep score and metrics', async () => {
    await expect(element(by.id('sleep-score'))).toBeVisible();
    await expect(element(by.id('sleep-duration-metric'))).toBeVisible();
    await expect(element(by.id('sleep-efficiency-metric'))).toBeVisible();
    await expect(element(by.id('sleep-quality-metric'))).toBeVisible();
  });

  it('should refresh data on pull-to-refresh', async () => {
    await element(by.id('dashboard-scroll-view')).scroll(200, 'down');
    await element(by.id('dashboard-scroll-view')).swipe('down', 'fast');
    
    // Should show loading indicator
    await expect(element(by.id('refresh-indicator'))).toBeVisible();
    
    // Wait for refresh to complete
    await waitFor(element(by.id('refresh-indicator'))).not.toBeVisible().withTimeout(5000);
  });

  it('should navigate to analytics screen', async () => {
    await element(by.text('View Analytics')).tap();
    await expect(element(by.text('Sleep Analytics'))).toBeVisible();
    
    // Should display charts
    await expect(element(by.id('sleep-trend-chart'))).toBeVisible();
    await expect(element(by.id('sleep-phase-chart'))).toBeVisible();
  });
});

// e2e/ai-chat.e2e.js
describe('AI Chat', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await element(by.text('Skip Onboarding')).tap();
  });

  it('should send message and receive response', async () => {
    // Navigate to chat tab
    await element(by.text('Chat')).tap();
    
    await expect(element(by.id('chat-input'))).toBeVisible();
    
    // Type message
    await element(by.id('chat-input')).typeText('How was my sleep last night?');
    await element(by.id('send-button')).tap();
    
    // Should show user message
    await expect(element(by.text('How was my sleep last night?'))).toBeVisible();
    
    // Should show typing indicator
    await expect(element(by.id('typing-indicator'))).toBeVisible();
    
    // Wait for AI response
    await waitFor(element(by.id('typing-indicator'))).not.toBeVisible().withTimeout(10000);
    
    // Should show AI response
    await expect(element(by.id('ai-response'))).toBeVisible();
  });

  it('should handle offline mode gracefully', async () => {
    // Simulate offline mode
    await device.setNetworkConnection({
      wifi: 'disconnected',
      cellular: 'disconnected'
    });

    await element(by.text('Chat')).tap();
    await element(by.id('chat-input')).typeText('Give me sleep tips');
    await element(by.id('send-button')).tap();

    // Should show offline response
    await waitFor(element(by.text(/offline/))).toBeVisible().withTimeout(5000);

    // Restore network
    await device.setNetworkConnection({
      wifi: 'connected',
      cellular: 'connected'
    });
  });
});
```

## 5. Deployment Configuration

### 5.1 EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production"
      },
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

This comprehensive technical implementation guide provides the foundation for building the Lunar sleep analysis app with proper architecture, testing, and deployment practices. The guide emphasizes performance, maintainability, and user experience while following React Native and Expo best practices.

---

**Document Status**: Ready for Implementation  
**Next Phase**: Begin Sprint 1 development following the component implementation order  
**Success Criteria**: All components tested with >90% coverage, performance benchmarks met