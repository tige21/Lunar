/**
 * Database schema definitions for Lunar Sleep Analysis App
 * SQLite table structures and migration scripts
 */

export const DATABASE_VERSION = 1;
export const DATABASE_NAME = 'lunar_sleep.db';

// Schema creation SQL statements
export const CREATE_TABLES = {
  // Sleep sessions table - main sleep data
  SLEEP_SESSIONS: `
    CREATE TABLE IF NOT EXISTS sleep_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      quality_overall INTEGER NOT NULL DEFAULT 0,
      quality_efficiency REAL NOT NULL DEFAULT 0,
      quality_restfulness INTEGER NOT NULL DEFAULT 0,
      heart_rate_avg INTEGER,
      heart_rate_min INTEGER,
      heart_rate_max INTEGER,
      heart_rate_variability REAL,
      environment_temperature REAL,
      environment_humidity REAL,
      environment_noise_level REAL,
      environment_light_level REAL,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Sleep stages/phases table
  SLEEP_STAGES: `
    CREATE TABLE IF NOT EXISTS sleep_stages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      stage TEXT NOT NULL CHECK (stage IN ('awake', 'light', 'deep', 'rem')),
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      sequence_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sleep_sessions (id) ON DELETE CASCADE
    );
  `,

  // Sleep quality factors table
  QUALITY_FACTORS: `
    CREATE TABLE IF NOT EXISTS quality_factors (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('stress', 'caffeine', 'exercise', 'screen_time', 'environment', 'medication')),
      impact TEXT NOT NULL CHECK (impact IN ('positive', 'negative', 'neutral')),
      severity INTEGER NOT NULL CHECK (severity IN (1, 2, 3)),
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sleep_sessions (id) ON DELETE CASCADE
    );
  `,

  // Heart rate data table for detailed tracking
  HEART_RATE_DATA: `
    CREATE TABLE IF NOT EXISTS heart_rate_data (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      bpm INTEGER NOT NULL,
      variability REAL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sleep_sessions (id) ON DELETE CASCADE
    );
  `,

  // User preferences table
  USER_PREFERENCES: `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY DEFAULT 'default_user',
      theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
      language TEXT NOT NULL DEFAULT 'en',
      timezone TEXT NOT NULL DEFAULT 'UTC',
      temperature_unit TEXT NOT NULL DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
      time_format TEXT NOT NULL DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
      date_format TEXT NOT NULL DEFAULT 'ISO' CHECK (date_format IN ('US', 'EU', 'ISO')),
      bedtime_reminder BOOLEAN NOT NULL DEFAULT 1,
      bedtime_reminder_time INTEGER NOT NULL DEFAULT 30,
      wake_alarm BOOLEAN NOT NULL DEFAULT 1,
      weekly_insights BOOLEAN NOT NULL DEFAULT 1,
      goal_achievements BOOLEAN NOT NULL DEFAULT 1,
      sleep_quality_alerts BOOLEAN NOT NULL DEFAULT 1,
      share_data BOOLEAN NOT NULL DEFAULT 0,
      anonymous_analytics BOOLEAN NOT NULL DEFAULT 1,
      health_kit_integration BOOLEAN NOT NULL DEFAULT 0,
      google_fit_integration BOOLEAN NOT NULL DEFAULT 0,
      data_retention_period INTEGER NOT NULL DEFAULT 730,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Health profile table
  HEALTH_PROFILE: `
    CREATE TABLE IF NOT EXISTS health_profile (
      id TEXT PRIMARY KEY DEFAULT 'default_user',
      age INTEGER,
      gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
      weight REAL,
      height REAL,
      activity_level TEXT NOT NULL DEFAULT 'moderately_active' 
        CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
      chronic_conditions TEXT, -- JSON string
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Sleep disorders table
  SLEEP_DISORDERS: `
    CREATE TABLE IF NOT EXISTS sleep_disorders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      type TEXT NOT NULL CHECK (type IN ('insomnia', 'sleep_apnea', 'restless_leg', 'narcolepsy', 'other')),
      diagnosed BOOLEAN NOT NULL DEFAULT 0,
      severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
      treatment TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Medications table
  MEDICATIONS: `
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      affects_sleep BOOLEAN NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Sleep goals table
  SLEEP_GOALS: `
    CREATE TABLE IF NOT EXISTS sleep_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      target_bedtime TEXT NOT NULL,
      target_wake_time TEXT NOT NULL,
      target_duration INTEGER NOT NULL,
      target_quality INTEGER NOT NULL DEFAULT 8,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Sleep insights table
  SLEEP_INSIGHTS: `
    CREATE TABLE IF NOT EXISTS sleep_insights (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      type TEXT NOT NULL CHECK (type IN ('pattern', 'recommendation', 'achievement', 'warning')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      actionable BOOLEAN NOT NULL DEFAULT 0,
      action_text TEXT,
      action_route TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      is_read BOOLEAN NOT NULL DEFAULT 0,
      expires_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `,

  // Sleep metrics calculated scores and analytics
  SLEEP_METRICS: `
    CREATE TABLE IF NOT EXISTS sleep_metrics (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sleep_score INTEGER NOT NULL DEFAULT 0 CHECK (sleep_score >= 0 AND sleep_score <= 100),
      efficiency_score INTEGER NOT NULL DEFAULT 0,
      duration_score INTEGER NOT NULL DEFAULT 0,
      consistency_score INTEGER NOT NULL DEFAULT 0,
      restoration_score INTEGER NOT NULL DEFAULT 0,
      deep_sleep_percentage REAL NOT NULL DEFAULT 0,
      rem_sleep_percentage REAL NOT NULL DEFAULT 0,
      light_sleep_percentage REAL NOT NULL DEFAULT 0,
      awake_percentage REAL NOT NULL DEFAULT 0,
      sleep_latency INTEGER, -- time to fall asleep in minutes
      wake_after_sleep_onset INTEGER, -- WASO in minutes
      number_of_awakenings INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sleep_sessions (id) ON DELETE CASCADE
    );
  `,

  // AI interactions table for chat history and recommendations
  AI_INTERACTIONS: `
    CREATE TABLE IF NOT EXISTS ai_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'default_user',
      conversation_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('question', 'answer', 'recommendation', 'insight')),
      content TEXT NOT NULL,
      metadata TEXT, -- JSON string for additional data
      context_session_ids TEXT, -- Comma-separated session IDs for context
      rating INTEGER CHECK (rating IN (1, 2, 3, 4, 5)),
      is_helpful BOOLEAN,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `
};

// Index creation for performance optimization
export const CREATE_INDEXES = {
  // Sleep sessions indexes
  IDX_SESSIONS_USER_DATE: 'CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sleep_sessions (user_id, start_time DESC);',
  IDX_SESSIONS_DATE_RANGE: 'CREATE INDEX IF NOT EXISTS idx_sessions_date_range ON sleep_sessions (start_time, end_time);',
  IDX_SESSIONS_QUALITY: 'CREATE INDEX IF NOT EXISTS idx_sessions_quality ON sleep_sessions (quality_overall DESC);',
  
  // Sleep stages indexes
  IDX_STAGES_SESSION: 'CREATE INDEX IF NOT EXISTS idx_stages_session ON sleep_stages (session_id, sequence_order);',
  IDX_STAGES_TYPE: 'CREATE INDEX IF NOT EXISTS idx_stages_type ON sleep_stages (stage, duration DESC);',
  
  // Heart rate data indexes
  IDX_HEART_RATE_SESSION: 'CREATE INDEX IF NOT EXISTS idx_heart_rate_session ON heart_rate_data (session_id, timestamp);',
  
  // Sleep metrics indexes
  IDX_METRICS_SESSION: 'CREATE INDEX IF NOT EXISTS idx_metrics_session ON sleep_metrics (session_id);',
  IDX_METRICS_SCORE: 'CREATE INDEX IF NOT EXISTS idx_metrics_score ON sleep_metrics (sleep_score DESC);',
  
  // AI interactions indexes
  IDX_AI_CONVERSATION: 'CREATE INDEX IF NOT EXISTS idx_ai_conversation ON ai_interactions (conversation_id, created_at DESC);',
  IDX_AI_USER_DATE: 'CREATE INDEX IF NOT EXISTS idx_ai_user_date ON ai_interactions (user_id, created_at DESC);',
  
  // Sleep insights indexes
  IDX_INSIGHTS_USER_UNREAD: 'CREATE INDEX IF NOT EXISTS idx_insights_user_unread ON sleep_insights (user_id, is_read, priority, created_at DESC);'
};

// Database migration scripts
export const MIGRATIONS = {
  1: {
    up: [
      ...Object.values(CREATE_TABLES),
      ...Object.values(CREATE_INDEXES)
    ],
    down: [
      'DROP TABLE IF EXISTS ai_interactions;',
      'DROP TABLE IF EXISTS sleep_metrics;',
      'DROP TABLE IF EXISTS sleep_insights;',
      'DROP TABLE IF EXISTS sleep_goals;',
      'DROP TABLE IF EXISTS medications;',
      'DROP TABLE IF EXISTS sleep_disorders;',
      'DROP TABLE IF EXISTS health_profile;',
      'DROP TABLE IF EXISTS user_preferences;',
      'DROP TABLE IF EXISTS heart_rate_data;',
      'DROP TABLE IF EXISTS quality_factors;',
      'DROP TABLE IF EXISTS sleep_stages;',
      'DROP TABLE IF EXISTS sleep_sessions;'
    ]
  }
};

// Trigger to update updated_at timestamps
export const CREATE_TRIGGERS = {
  UPDATE_SESSIONS_TIMESTAMP: `
    CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp 
    AFTER UPDATE ON sleep_sessions
    BEGIN
      UPDATE sleep_sessions SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `,
  
  UPDATE_PREFERENCES_TIMESTAMP: `
    CREATE TRIGGER IF NOT EXISTS update_preferences_timestamp 
    AFTER UPDATE ON user_preferences
    BEGIN
      UPDATE user_preferences SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `,
  
  UPDATE_HEALTH_PROFILE_TIMESTAMP: `
    CREATE TRIGGER IF NOT EXISTS update_health_profile_timestamp 
    AFTER UPDATE ON health_profile
    BEGIN
      UPDATE health_profile SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `,
  
  UPDATE_SLEEP_GOALS_TIMESTAMP: `
    CREATE TRIGGER IF NOT EXISTS update_sleep_goals_timestamp 
    AFTER UPDATE ON sleep_goals
    BEGIN
      UPDATE sleep_goals SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
    END;
  `
};

// Data validation constraints
export const DATA_CONSTRAINTS = {
  MAX_SESSION_DURATION: 24 * 60, // 24 hours in minutes
  MIN_SESSION_DURATION: 30, // 30 minutes
  MAX_HEART_RATE: 220,
  MIN_HEART_RATE: 30,
  MAX_DATA_RETENTION_DAYS: 2 * 365, // 2 years
  MIN_DATA_RETENTION_DAYS: 30
};