import { StyleSheet, Text, type TextProps, Dimensions, PixelRatio } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, DesignTokens } from '@/constants/Colors';

// Responsive typography utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // Base on iPhone X width
const verticalScale = SCREEN_HEIGHT / 812; // Base on iPhone X height

// Normalize font size with min/max bounds for better control
function normalize(size: number): number {
  const newSize = size * scale;
  // Prevent fonts from being too small on small devices or too large on tablets
  if (SCREEN_WIDTH <= 320) {
    return Math.max(newSize * 0.9, size * 0.85);
  }
  if (SCREEN_WIDTH >= 768) {
    return Math.min(newSize * 1.1, size * 1.25);
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Responsive line height calculation
function getLineHeight(fontSize: number, ratio: number = 1.5): number {
  return Math.round(fontSize * ratio);
}

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'sleep-data' | 'heading' | 'body' | 'metric' | 'display' | 'label' | 'sleep-time' | 'sleep-score' | 'small-metric' | 'hero';
  variant?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'sleep-deep' | 'sleep-rem' | 'sleep-light' | 'sleep-wake';
  responsive?: boolean; // Enable responsive scaling
  maxLines?: number; // Text truncation support
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant,
  responsive = true,
  maxLines,
  ...rest
}: ThemedTextProps) {
  const getTextColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    }
    
    // Handle variants first
    if (variant) {
      switch (variant) {
        case 'primary':
          return useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'text');
        case 'secondary':
          return useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
        case 'muted':
          return useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
        case 'success':
          return Colors.semantic.success;
        case 'warning':
          return Colors.semantic.warning;
        case 'error':
          return Colors.semantic.error;
        case 'sleep-deep':
          return Colors.sleepStages.deep;
        case 'sleep-rem':
          return Colors.sleepStages.rem;
        case 'sleep-light':
          return Colors.sleepStages.light;
        case 'sleep-wake':
          return Colors.sleepStages.wake;
      }
    }
    
    switch (type) {
      case 'link':
        return useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'text');
      case 'caption':
        return useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
      case 'sleep-data':
      case 'sleep-time':
      case 'sleep-score':
      case 'metric':
      case 'small-metric':
        return useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'text');
      case 'label':
        return useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
      default:
        return useThemeColor({}, 'text');
    }
  };

  const color = getTextColor();

  // Choose responsive or static styles based on prop
  const getTypeStyle = (type: string) => {
    const styleMap = responsive ? responsiveStyles : styles;
    switch (type) {
      case 'default': return styleMap.default;
      case 'title': return styleMap.title;
      case 'defaultSemiBold': return styleMap.defaultSemiBold;
      case 'subtitle': return styleMap.subtitle;
      case 'link': return styleMap.link;
      case 'caption': return styleMap.caption;
      case 'sleep-data': return styleMap.sleepData;
      case 'heading': return styleMap.heading;
      case 'body': return styleMap.body;
      case 'metric': return styleMap.metric;
      case 'display': return styleMap.display;
      case 'label': return styleMap.label;
      case 'sleep-time': return styleMap.sleepTime;
      case 'sleep-score': return styleMap.sleepScore;
      case 'small-metric': return styleMap.smallMetric;
      case 'hero': return styleMap.hero;
      default: return undefined;
    }
  };

  return (
    <Text
      style={[
        { color },
        getTypeStyle(type),
        style,
      ]}
      numberOfLines={maxLines}
      ellipsizeMode={maxLines ? 'tail' : undefined}
      adjustsFontSizeToFit={responsive && (type === 'title' || type === 'hero' || type === 'display')}
      minimumFontScale={0.8}
      {...rest}
    />
  );
}

// Static styles (original, for backwards compatibility)
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
    fontFamily: 'Inter-Bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    fontFamily: 'Inter-SemiBold',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sleepData: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    fontFamily: 'SpaceMono',
    letterSpacing: -0.5,
  },
  link: {
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  metric: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 40,
    fontFamily: 'SpaceMono',
    letterSpacing: -1,
  },
  display: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 56,
    fontFamily: 'Inter-Bold',
    letterSpacing: -2,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sleepTime: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 54,
    fontFamily: 'SpaceMono',
    letterSpacing: -1.5,
  },
  sleepScore: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
    fontFamily: 'Inter-Bold',
    letterSpacing: -2,
  },
  smallMetric: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.5,
  },
  hero: {
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
    fontFamily: 'Inter-Bold',
    letterSpacing: -3,
  },
});

// Responsive styles with proper scaling
const responsiveStyles = StyleSheet.create({
  default: {
    fontSize: normalize(DesignTokens.fontSize.base),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.base)),
    fontFamily: 'Inter',
  },
  defaultSemiBold: {
    fontSize: normalize(DesignTokens.fontSize.base),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.base)),
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontSize: normalize(DesignTokens.fontSize['3xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['3xl']), 1.2),
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: normalize(DesignTokens.fontSize['2xl']),
    fontWeight: '600',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['2xl']), 1.3),
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    fontSize: normalize(DesignTokens.fontSize.xl),
    fontWeight: '600',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.xl), 1.4),
    fontFamily: 'Inter-SemiBold',
  },
  caption: {
    fontSize: normalize(DesignTokens.fontSize.xs),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.xs), 1.4),
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sleepData: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(28), 1.2),
    fontFamily: 'SpaceMono',
    letterSpacing: -0.5,
  },
  link: {
    fontSize: normalize(DesignTokens.fontSize.base),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.base)),
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  body: {
    fontSize: normalize(DesignTokens.fontSize.base),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.base), 1.6),
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  metric: {
    fontSize: normalize(DesignTokens.fontSize['4xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['4xl']), 1.1),
    fontFamily: 'SpaceMono',
    letterSpacing: -1,
  },
  display: {
    fontSize: normalize(DesignTokens.fontSize['5xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['5xl']), 1.1),
    fontFamily: 'Inter-Bold',
    letterSpacing: -1.5,
  },
  label: {
    fontSize: normalize(DesignTokens.fontSize.sm),
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.sm), 1.4),
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sleepTime: {
    fontSize: normalize(DesignTokens.fontSize['5xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['5xl']), 1.1),
    fontFamily: 'SpaceMono',
    letterSpacing: -1.5,
  },
  sleepScore: {
    fontSize: normalize(DesignTokens.fontSize['6xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['6xl']), 1.1),
    fontFamily: 'Inter-Bold',
    letterSpacing: -2,
  },
  smallMetric: {
    fontSize: normalize(DesignTokens.fontSize.xl),
    fontWeight: '600',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize.xl), 1.2),
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.5,
  },
  hero: {
    fontSize: normalize(DesignTokens.fontSize['7xl']),
    fontWeight: 'bold',
    lineHeight: getLineHeight(normalize(DesignTokens.fontSize['7xl']), 1.1),
    fontFamily: 'Inter-Bold',
    letterSpacing: -2.5,
  },
});
