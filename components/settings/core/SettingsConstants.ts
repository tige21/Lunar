import { Easing } from 'react-native-reanimated';
import { AnimationPreset, SettingsTheme } from './SettingsTypes';
import { Colors, DesignTokens } from '@/constants/Colors';

// Animation presets for consistent motion design
export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  smoothExpand: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  quickFade: {
    duration: 200,
    easing: Easing.linear,
    useNativeDriver: true,
  },
  bounceScale: {
    duration: 300,
    easing: Easing.back(1.2),
    useNativeDriver: true,
  },
  slideIn: {
    duration: 350,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
    delay: 50,
  },
  springy: {
    duration: 500,
    easing: Easing.elastic(1),
    useNativeDriver: true,
  },
};

// Settings theme tokens using main design system
export const SETTINGS_THEME: SettingsTheme = {
  colors: {
    cardBackground: Colors.light.cardSolid,
    cardBackgroundHover: Colors.light.surfaceSolid,
    primary: Colors.light.tint,
    secondary: '#A78BFA',
    accent: '#F59E0B',
    text: Colors.light.text,
    textSecondary: '#6B7280',
    border: Colors.light.border,
    shadow: Colors.light.glass.shadow,
    gradient: [Colors.light.tint, '#A78BFA', '#C084FC'],
  },
  spacing: DesignTokens.spacing,
  borderRadius: DesignTokens.borderRadius,
  elevation: {
    low: 2,
    medium: 4,
    high: 8,
  },
};

// Dark theme variant using main design system
export const SETTINGS_DARK_THEME: SettingsTheme = {
  ...SETTINGS_THEME,
  colors: {
    ...SETTINGS_THEME.colors,
    cardBackground: Colors.dark.cardSolid,
    cardBackgroundHover: Colors.dark.surfaceSolid,
    primary: Colors.dark.tint,
    text: Colors.dark.text,
    textSecondary: '#9CA3AF',
    border: Colors.dark.border,
    shadow: Colors.dark.glass.shadow,
    gradient: [Colors.dark.tint, '#A78BFA', '#C084FC'],
  },
};

// Touch target sizes (iOS HIG & Material Design)
export const TOUCH_TARGETS = {
  minimum: 44, // iOS minimum
  recommended: 48, // Material Design recommendation
  large: 56, // Large touch targets
};

// Accessibility constants
export const ACCESSIBILITY = {
  minimumContrast: 4.5, // WCAG AA standard
  largeFontThreshold: 18,
  reducedMotionQuery: 'reduce',
  screenReaderDelay: 100, // ms delay for screen reader announcements
};

// Sleep-specific settings defaults
export const SLEEP_DEFAULTS = {
  sleepGoalHours: 8,
  sleepGoalRange: [6, 12] as [number, number],
  bedtimeRange: ['20:00', '02:00'] as [string, string],
  wakeTimeRange: ['05:00', '12:00'] as [string, string],
  smartAlarmWindow: 30, // minutes
  trackingInterval: 5, // minutes
  minSleepDuration: 180, // minutes (3 hours)
  maxSleepDuration: 720, // minutes (12 hours)
};

// AI settings defaults
export const AI_DEFAULTS = {
  responseStyles: [
    { value: 'friendly', label: 'Дружелюбный', description: 'Теплый и поддерживающий тон' },
    { value: 'professional', label: 'Профессиональный', description: 'Деловой и четкий стиль' },
    { value: 'scientific', label: 'Научный', description: 'Подробные объяснения с фактами' },
    { value: 'motivating', label: 'Мотивирующий', description: 'Вдохновляющий и энергичный' },
  ],
  responseLengths: [
    { value: 'brief', label: 'Краткие', description: 'Короткие ответы по существу' },
    { value: 'medium', label: 'Средние', description: 'Оптимальный баланс детализации' },
    { value: 'detailed', label: 'Подробные', description: 'Развернутые объяснения' },
  ],
  languages: [
    { value: 'auto', label: 'Автоматически', description: 'По системным настройкам' },
    { value: 'ru', label: 'Русский', description: 'Всегда русский язык' },
    { value: 'en', label: 'English', description: 'Always English' },
  ],
};

// Performance constants
export const PERFORMANCE = {
  lazyLoadThreshold: 100, // pixels before loading
  debounceMs: 300, // debounce time for updates
  maxConcurrentAnimations: 3,
  virtualScrollThreshold: 20, // items before virtualization
  imageCache: {
    maxSize: 50, // MB
    ttl: 86400000, // 24 hours in ms
  },
};

// Platform-specific constants
export const PLATFORM_CONSTANTS = {
  ios: {
    headerHeight: 44,
    tabBarHeight: 83,
    safeAreaInsets: { top: 44, bottom: 34 },
    hapticPatterns: {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    },
  },
  android: {
    headerHeight: 56,
    tabBarHeight: 56,
    safeAreaInsets: { top: 24, bottom: 0 },
    rippleDuration: 300,
    elevationAnimationDuration: 200,
  },
};

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  aiRecommendations: true,
  advancedAnimations: true,
  biometricLock: true,
  socialFeatures: false,
  premiumFeatures: true,
  betaFeatures: false,
};