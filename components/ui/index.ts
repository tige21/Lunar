/**
 * Lunar Sleep App - UI Component Exports
 * 
 * Centralized exports for all themed UI components
 * optimized for sleep tracking and health data visualization
 */

// Core themed components (from parent directory for consistency)
export { ThemedView } from '../ThemedView';
export { ThemedText } from '../ThemedText';
export { ThemedButton } from '../ThemedButton';

// Enhanced responsive text components
export { ResponsiveText, HeroText, TitleText, BodyText, CaptionText, MetricText, LabelText } from './ResponsiveText';

// Sleep-specific visualization components
export { SleepScore } from './SleepScore';
export { SleepPhaseChart } from './SleepPhaseChart';
export { MetricsCard } from './MetricsCard';
export { TrendChart } from './TrendChart';
export { SleepGoalTracker } from './SleepGoalTracker';

// Interactive components
export { TimePicker } from './TimePicker';
export { RangeSlider } from './RangeSlider';
export { ToggleButton } from './ToggleButton';

// Layout components
export { SafeContainer } from './SafeContainer';
export { ScrollContainer } from './ScrollContainer';
export { Modal } from './Modal';

// Health integration components
export { HealthSyncStatus } from './HealthSyncStatus';

// State components
export { LoadingState } from './LoadingStates';
export { EmptyState, SleepDataEmptyState, PermissionsEmptyState, HistoryEmptyState, ErrorEmptyState } from './EmptyState';
export { OnboardingProgress } from './OnboardingProgress';
export { OnboardingNavigation } from './OnboardingNavigation';
export { OnboardingPager } from './OnboardingPager';

// Animation components
export { AnimatedContainer } from './AnimatedContainer';
export { SwipeableProgress } from './SwipeableProgress';
export { InteractiveButton } from './InteractiveButton';

// Legacy sleep components (if they exist)
export { SleepCard } from './SleepCard';
export { SleepProgressBar } from './SleepProgressBar';

// Chat components
export { ChatBubble } from './ChatBubble';
export { TypingIndicator } from './TypingIndicator';
export { QuickSuggestions } from './QuickSuggestions';
export { SmartReplies, generateSmartReplies } from './SmartReplies';

// Theme provider
export { LunarThemeProvider } from '../providers/LunarThemeProvider';

// Types (updated paths)
export type { ThemedViewProps } from '../ThemedView';
export type { ThemedTextProps } from '../ThemedText';
export type { ThemedButtonProps } from '../ThemedButton';
export type { ResponsiveTextProps } from './ResponsiveText';
export type { SleepScoreProps } from './SleepScore';
export type { SleepPhaseChartProps, SleepPhase } from './SleepPhaseChart';
export type { MetricsCardProps } from './MetricsCard';
export type { TrendChartProps, DataPoint } from './TrendChart';
export type { SleepGoalTrackerProps } from './SleepGoalTracker';
export type { TimePickerProps } from './TimePicker';
export type { RangeSliderProps } from './RangeSlider';
export type { ToggleButtonProps } from './ToggleButton';
export type { SafeContainerProps } from './SafeContainer';
export type { ScrollContainerProps } from './ScrollContainer';
export type { ModalProps } from './Modal';
export type { HealthSyncStatusProps } from './HealthSyncStatus';
export type { LoadingStateProps } from './LoadingStates';
export type { EmptyStateProps } from './EmptyState';
export type { OnboardingProgressProps } from './OnboardingProgress';
export type { OnboardingNavigationProps } from './OnboardingNavigation';
export type { OnboardingPagerProps } from './OnboardingPager';

// Legacy types (if they exist)
export type { SleepCardProps } from './SleepCard';
export type { SleepProgressBarProps } from './SleepProgressBar';

// Chat types
export type { ChatMessage } from './ChatBubble';
export type { QuickSuggestion } from './QuickSuggestions';

// Enhanced Typography Constants
export { Typography, TextStyles, Spacing, BorderRadius } from '../../constants/Typography';

// Design System Constants
export const LUNAR_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const LUNAR_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const LUNAR_SHADOWS = {
  none: 'none',
  soft: 'soft',
  hard: 'hard',
  glow: 'glow',
} as const;

// Sleep-specific design tokens
export const SLEEP_COLORS = {
  deep: '#1E1B3C',
  rem: '#3B1A78',
  light: '#4C1D95',
  wake: '#EA580C',
  awake: '#F7A532',
} as const;

// Component size variants
export const COMPONENT_SIZES = {
  small: 'small',
  medium: 'medium',
  large: 'large',
  xl: 'xl',
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1200,
} as const;

// Sleep-specific component presets
export const SLEEP_CARD_VARIANTS = {
  compact: { size: 'compact' as const, interactive: false },
  default: { size: 'default' as const, interactive: true },
  large: { size: 'large' as const, interactive: true, showGlow: true },
} as const;

export const SLEEP_SCORE_PRESETS = {
  dashboard: { size: 'large' as const, animated: true, showGlow: true },
  card: { size: 'medium' as const, animated: true, showGlow: false },
  compact: { size: 'small' as const, animated: false, showGlow: false },
} as const;