/**
 * Typography utilities for responsive text scaling and consistent design
 * Provides utilities for device-specific font scaling, line heights, and spacing
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';
import { DesignTokens } from './Colors';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone X as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Device size categories for different styling approaches
 */
export const DeviceSize = {
  isSmallDevice: SCREEN_WIDTH <= 320,
  isMediumDevice: SCREEN_WIDTH > 320 && SCREEN_WIDTH <= 375,
  isLargeDevice: SCREEN_WIDTH > 375 && SCREEN_WIDTH <= 414,
  isTablet: SCREEN_WIDTH >= 768,
  isCompact: SCREEN_HEIGHT <= 667,
};

/**
 * Normalize font size based on device width with min/max constraints
 * @param size - Base font size in pixels
 * @param factor - Optional scaling factor (default: width-based)
 * @returns Normalized font size
 */
export function normalize(size: number, factor?: number): number {
  const scale = factor || widthScale;
  let newSize = size * scale;

  // Device-specific adjustments
  if (DeviceSize.isSmallDevice) {
    // Prevent text from being too small on small devices
    newSize = Math.max(newSize * 0.9, size * 0.85);
  } else if (DeviceSize.isTablet) {
    // Prevent text from being too large on tablets
    newSize = Math.min(newSize * 1.1, size * 1.25);
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Calculate responsive line height based on font size
 * @param fontSize - Font size in pixels
 * @param ratio - Line height ratio (default: 1.5)
 * @returns Calculated line height
 */
export function getLineHeight(fontSize: number, ratio: number = 1.5): number {
  return Math.round(fontSize * ratio);
}

/**
 * Calculate responsive spacing based on design tokens
 * @param tokenSize - Design token size key
 * @returns Normalized spacing value
 */
export function getSpacing(tokenSize: keyof typeof DesignTokens.spacing): number {
  return normalize(DesignTokens.spacing[tokenSize], 0.8); // Slightly less aggressive scaling for spacing
}

/**
 * Get responsive border radius
 * @param tokenSize - Design token border radius key
 * @returns Normalized border radius
 */
export function getBorderRadius(tokenSize: keyof typeof DesignTokens.borderRadius): number {
  return normalize(DesignTokens.borderRadius[tokenSize], 0.6); // Even less aggressive for border radius
}

/**
 * Typography scale with responsive sizing
 * Based on design tokens but with device-appropriate scaling
 */
export const Typography = {
  // Font sizes
  sizes: {
    xs: normalize(DesignTokens.fontSize.xs),
    sm: normalize(DesignTokens.fontSize.sm),
    base: normalize(DesignTokens.fontSize.base),
    lg: normalize(DesignTokens.fontSize.lg),
    xl: normalize(DesignTokens.fontSize.xl),
    '2xl': normalize(DesignTokens.fontSize['2xl']),
    '3xl': normalize(DesignTokens.fontSize['3xl']),
    '4xl': normalize(DesignTokens.fontSize['4xl']),
    '5xl': normalize(DesignTokens.fontSize['5xl']),
    '6xl': normalize(DesignTokens.fontSize['6xl']),
    '7xl': normalize(DesignTokens.fontSize['7xl']),
  },

  // Line heights with optimal ratios
  lineHeights: {
    xs: getLineHeight(normalize(DesignTokens.fontSize.xs), 1.4),
    sm: getLineHeight(normalize(DesignTokens.fontSize.sm), 1.4),
    base: getLineHeight(normalize(DesignTokens.fontSize.base), 1.5),
    lg: getLineHeight(normalize(DesignTokens.fontSize.lg), 1.5),
    xl: getLineHeight(normalize(DesignTokens.fontSize.xl), 1.4),
    '2xl': getLineHeight(normalize(DesignTokens.fontSize['2xl']), 1.3),
    '3xl': getLineHeight(normalize(DesignTokens.fontSize['3xl']), 1.2),
    '4xl': getLineHeight(normalize(DesignTokens.fontSize['4xl']), 1.1),
    '5xl': getLineHeight(normalize(DesignTokens.fontSize['5xl']), 1.1),
    '6xl': getLineHeight(normalize(DesignTokens.fontSize['6xl']), 1.05),
    '7xl': getLineHeight(normalize(DesignTokens.fontSize['7xl']), 1.05),
  },

  // Letter spacing for different text types
  letterSpacing: {
    tight: -1.5,
    normal: 0,
    wide: 0.5,
    wider: 0.8,
    widest: 1.2,
  },

  // Font weights
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Font families
  families: {
    default: 'Inter',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    mono: 'SpaceMono',
  },
};

/**
 * Responsive spacing scale
 */
export const Spacing = {
  xs: getSpacing('xs'),
  sm: getSpacing('sm'),
  md: getSpacing('md'),
  lg: getSpacing('lg'),
  xl: getSpacing('xl'),
  '2xl': getSpacing('2xl'),
  '3xl': getSpacing('3xl'),
};

/**
 * Responsive border radius scale
 */
export const BorderRadius = {
  sm: getBorderRadius('sm'),
  md: getBorderRadius('md'),
  lg: getBorderRadius('lg'),
  xl: getBorderRadius('xl'),
  '2xl': getBorderRadius('2xl'),
  '3xl': getBorderRadius('3xl'),
  full: 9999,
};

/**
 * Text style presets for common use cases
 */
export const TextStyles = {
  // Hero text for landing pages
  hero: {
    fontSize: Typography.sizes['7xl'],
    lineHeight: Typography.lineHeights['7xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
    fontFamily: Typography.families.bold,
  },

  // Large display text
  display: {
    fontSize: Typography.sizes['5xl'],
    lineHeight: Typography.lineHeights['5xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
    fontFamily: Typography.families.bold,
  },

  // Page titles
  title: {
    fontSize: Typography.sizes['3xl'],
    lineHeight: Typography.lineHeights['3xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.normal,
    fontFamily: Typography.families.bold,
  },

  // Section headings
  heading: {
    fontSize: Typography.sizes['2xl'],
    lineHeight: Typography.lineHeights['2xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.normal,
    fontFamily: Typography.families.semibold,
  },

  // Subsection titles
  subtitle: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.lineHeights.xl,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.normal,
    fontFamily: Typography.families.semibold,
  },

  // Body text
  body: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.base,
    fontWeight: Typography.weights.normal,
    letterSpacing: Typography.letterSpacing.normal,
    fontFamily: Typography.families.default,
  },

  // Labels and small text
  label: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wider,
    fontFamily: Typography.families.medium,
  },

  // Captions and footnotes
  caption: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wide,
    fontFamily: Typography.families.medium,
  },

  // Metric displays
  metric: {
    fontSize: Typography.sizes['4xl'],
    lineHeight: Typography.lineHeights['4xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
    fontFamily: Typography.families.mono,
  },

  // Sleep data displays
  sleepData: {
    fontSize: normalize(28),
    lineHeight: getLineHeight(normalize(28), 1.2),
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.normal,
    fontFamily: Typography.families.mono,
  },
};

/**
 * Platform-specific text adjustments
 */
export const PlatformText = {
  // iOS tends to render fonts slightly larger
  fontScale: Platform.OS === 'ios' ? 1 : 1.02,
  
  // Line height adjustments for better rendering
  lineHeightOffset: Platform.OS === 'ios' ? 0 : 1,
};

/**
 * Accessibility helpers for text scaling
 */
export const AccessibilityText = {
  // Get scaled font size for accessibility
  getAccessibleSize: (baseSize: number, accessibilityScale: number = 1): number => {
    return normalize(baseSize * Math.min(accessibilityScale, 1.3)); // Cap at 30% increase
  },

  // Ensure minimum touch target sizes for text links
  minimumTouchTarget: 44,
  
  // High contrast text settings
  highContrast: {
    textShadow: '0px 0px 3px rgba(0,0,0,0.8)',
    fontWeight: Typography.weights.semibold,
  },
};

export default Typography;