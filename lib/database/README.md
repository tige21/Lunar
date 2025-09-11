# Lunar Sleep Database Service

A comprehensive SQLite database service for the Lunar sleep analysis mobile app, built with React Native and Expo SQLite.

## Overview

The database service provides a complete data management solution for sleep tracking, user preferences, AI interactions, and analytics. It's designed for privacy-focused local storage with no external dependencies.

## Architecture

```
lib/database/
├── schema.ts          # Database schema, tables, indexes
├── types.ts           # TypeScript type definitions
├── database.ts        # Core database service & migrations
├── sleepService.ts    # Sleep session & metrics operations
├── userService.ts     # User preferences, goals & insights
├── aiService.ts       # AI chat & recommendation storage
├── dataService.ts     # Export, import, backup & cleanup
├── index.ts           # Main exports & convenience functions
├── example.ts         # Usage examples & demonstrations
└── README.md          # This documentation
```

## Key Features

### 🗄️ **Complete Data Model**
- Sleep sessions with detailed stages (REM, Deep, Light, Awake)
- Comprehensive sleep metrics and scoring (0-100 scale)
- User preferences with notification & privacy settings
- Health profiles with sleep disorders & medications
- Sleep goals with progress tracking
- AI chat history and personalized insights

### 🔒 **Privacy-First Design**
- 100% local SQLite storage
- No external API dependencies  
- User-controlled data retention policies
- Optional data export in JSON/CSV formats
- Secure data cleanup and deletion

### ⚡ **High Performance**
- Optimized database schema with proper indexes
- Batch operations for large datasets
- Memory-efficient queries with pagination
- Background processing capabilities
- Automatic database maintenance

### 🛠️ **Developer Experience**
- Full TypeScript support with strict typing
- Comprehensive error handling and logging
- Database migrations and version management
- Data validation and integrity checks
- Extensive examples and documentation

## Quick Start

### 1. Initialize Database

```typescript
import { initializeDatabase, DatabaseManager } from '@/lib/database';

// Initialize on app startup
await initializeDatabase();

// Check if ready
if (DatabaseManager.isReady()) {
  console.log('Database ready for use');
}
```

### 2. Create Sleep Session

```typescript
import { createCompleteSleepSession } from '@/lib/database';

const result = await createCompleteSleepSession({
  startTime: new Date('2024-12-09T23:00:00'),
  endTime: new Date('2024-12-10T07:00:00'),
  stages: [
    { stage: 'light', startTime: ..., endTime: ... },
    { stage: 'deep', startTime: ..., endTime: ... },
    { stage: 'rem', startTime: ..., endTime: ... }
  ],
  quality: { overall: 8, efficiency: 85, restfulness: 7 },
  notes: 'Felt well rested'
});

if (result.success) {
  console.log('Session created:', result.data);
}
```

### 3. Get Recent Sleep Data

```typescript
import { getQuickSleepSummary } from '@/lib/database';

const summary = await getQuickSleepSummary('user_id', 7);
console.log({
  recentSessions: summary.recentSessions.length,
  averageScore: summary.averageScore,
  activeGoal: summary.activeGoal,
  unreadInsights: summary.unreadInsights
});
```

## Service APIs

### SleepService
- `createSession()` - Record new sleep session
- `getSessions()` - Retrieve sessions with filtering
- `updateSession()` - Modify existing session
- `deleteSession()` - Remove session and related data
- `getMetrics()` - Get calculated sleep scores
- `getSleepTrends()` - Analytics for time periods

### UserService  
- `getPreferences()` / `updatePreferences()` - User settings
- `getHealthProfile()` / `updateHealthProfile()` - Health data
- `getActiveGoal()` / `setGoal()` - Sleep goal management
- `createInsight()` / `getInsights()` - Personalized insights
- `getUser()` - Complete user profile

### AIService
- `startConversation()` - Begin chat session
- `createInteraction()` - Log AI responses
- `getConversation()` - Retrieve chat history
- `searchInteractions()` - Find past conversations
- `getInteractionStats()` - Usage analytics

### DataService
- `exportUserData()` - JSON export for backup
- `exportToCSV()` - Spreadsheet-compatible export
- `importUserData()` - Restore from backup
- `cleanupOldData()` - Automatic data cleanup
- `validateDataIntegrity()` - Check data consistency

## Database Schema

### Core Tables

**sleep_sessions** - Main sleep tracking data
- Duration, quality scores, environment data
- Heart rate and variability metrics
- User notes and timestamps

**sleep_stages** - Detailed sleep phase data  
- Stage types (awake, light, deep, rem)
- Duration and sequence tracking
- Linked to parent session

**sleep_metrics** - Calculated analytics
- Overall sleep score (0-100)
- Stage percentages and efficiency
- Sleep latency and awakening counts

**user_preferences** - App settings
- Theme, language, timezone
- Notification preferences  
- Privacy and data sharing controls

**sleep_goals** - Target tracking
- Bedtime and duration goals
- Quality targets and progress
- Active/inactive goal management

### Analytics & AI Tables

**sleep_insights** - Personalized recommendations
- Pattern recognition results
- Actionable suggestions
- Priority levels and expiration

**ai_interactions** - Chat history
- Question/answer pairs
- Conversation threading
- User feedback and ratings

## Data Types & Validation

### Sleep Quality Scores
- Overall quality: 1-10 scale (stored as 0-100 internally)
- Sleep efficiency: 0-100 percentage
- Restoration score: Calculated from sleep stages

### Sleep Stages
- **Light Sleep**: Transition and maintenance
- **Deep Sleep**: Physical restoration (target: 20-25%)
- **REM Sleep**: Mental/emotional processing (target: 20-25%)
- **Awake**: Sleep latency and night awakenings

### Health Data
- Age, gender, activity level
- Sleep disorders and medications
- Chronic conditions affecting sleep

## Performance Optimizations

### Database Indexes
- Session lookups by user and date range
- Stage queries by session and type
- Metrics sorted by sleep score
- AI conversations by recency

### Query Strategies
- Pagination for large result sets
- Batch operations for imports
- Prepared statements for security
- Connection pooling and reuse

### Storage Efficiency
- Integer timestamps (4 bytes vs 8 for dates)
- Normalized stage and factor tables
- JSON storage for flexible metadata
- Automatic VACUUM on cleanup

## Data Privacy & Security

### Local-Only Storage
- SQLite database stored on device
- No cloud synchronization by default
- User controls all data sharing

### Data Retention
- Configurable retention periods (default: 2 years)
- Automatic cleanup of expired data
- User-triggered complete data deletion

### Export & Portability
- Standard JSON format for backups
- CSV exports for analysis tools
- Preserves data relationships

## Error Handling

All database operations return a consistent `DatabaseResult<T>` type:

```typescript
interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  rowsAffected?: number;
}
```

### Common Error Scenarios
- Database initialization failures
- Schema migration errors  
- Data validation violations
- Storage space limitations
- Transaction rollbacks

## Testing & Development

### Example Usage
See `example.ts` for comprehensive usage examples including:
- Database setup and initialization
- Sample data creation
- AI interaction logging
- Export/import operations
- Maintenance tasks

### Development Tools
```typescript
// Health check
const health = await DatabaseManager.getHealthStatus();

// Performance maintenance  
await DatabaseManager.performMaintenance();

// Complete reset (development only)
await DatabaseManager.resetAllData();
```

## Migration Strategy

The database supports versioned migrations:

```typescript
export const MIGRATIONS = {
  1: {
    up: [/* SQL statements to create v1 schema */],
    down: [/* SQL statements to revert v1 */]
  },
  2: {
    up: [/* SQL statements to upgrade to v2 */],
    down: [/* SQL statements to revert v2 */]
  }
};
```

Migrations run automatically on app startup, ensuring users always have the latest schema version.

## Best Practices

### Performance
- Use pagination for large datasets
- Batch insert operations when possible  
- Run cleanup operations during off-peak times
- Monitor database size and performance

### Data Quality
- Validate input data before storage
- Use transactions for related operations
- Implement data integrity checks
- Handle edge cases gracefully

### User Experience
- Provide feedback for long operations
- Allow cancellation of exports/imports
- Cache frequently accessed data
- Handle offline scenarios

### Privacy
- Default to minimal data collection
- Allow users to control retention
- Provide clear export options
- Support complete data deletion

## Contributing

When extending the database service:

1. Update schema definitions in `schema.ts`
2. Add TypeScript types in `types.ts`  
3. Implement service methods with proper error handling
4. Add comprehensive examples in `example.ts`
5. Update this documentation

## License

Part of the Lunar Sleep Analysis App - see main project license.