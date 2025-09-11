import React from 'react';
import { StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeInDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from './IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export interface MetricsCardProps {
  title: string;
  value: number;
  format?: 'number' | 'percentage' | 'duration' | 'score' | 'currency';
  icon?: string;
  color?: string;
  trend?: number; // Percentage change, positive for increase, negative for decrease
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  showGlow?: boolean;
  animated?: boolean;
  onPress?: () => void;
  delay?: number;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 64) / 2; // 2 cards per row with margins

export function MetricsCard({
  title,
  value,
  format = 'number',
  icon,
  color,
  trend,
  subtitle,
  size = 'medium',
  interactive = false,
  showGlow = false,
  animated = true,
  onPress,
  delay = 0
}: MetricsCardProps) {
  const scaleValue = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  const primaryColor = color || useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  React.useEffect(() => {
    if (showGlow && animated) {
      glowOpacity.value = withTiming(0.3, { duration: 1000 });
    }
  }, [showGlow, animated]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(val)}%`;
      case 'duration':
        if (val >= 60) {
          const hours = Math.floor(val / 60);
          const minutes = Math.round(val % 60);
          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
        return `${Math.round(val)}m`;
      case 'score':
        return Math.round(val).toString();
      case 'currency':
        return `$${val.toFixed(2)}`;
      default:
        return Math.round(val).toString();
    }
  };

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return 'arrow.up.right';
    if (trendValue < 0) return 'arrow.down.right';
    return 'minus';
  };

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return Colors.semantic.success;
    if (trendValue < 0) return Colors.semantic.error;
    return Colors.semantic.warning;
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: cardWidth - 6, minHeight: 100 };
      case 'large':
        return { width: width - 40, minHeight: 140 };
      default:
        return { width: cardWidth, minHeight: 120 };
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }]
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity.value,
      shadowRadius: interpolate(glowOpacity.value, [0, 1], [0, 12], Extrapolate.CLAMP),
      elevation: interpolate(glowOpacity.value, [0, 1], [0, 8], Extrapolate.CLAMP),
    };
  });

  const handlePressIn = () => {
    if (interactive) {
      scaleValue.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (interactive && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const cardContent = (
    <ThemedView style={[
      styles.card,
      getCardSize(),
      { backgroundColor },
      styles.shadow
    ]}>
      {/* Header with Icon and Trend */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.iconContainer}>
          {icon && (
            <ThemedView style={[styles.iconWrapper, { backgroundColor: primaryColor + '20' }]}>
              <IconSymbol
                name={icon}
                size={size === 'large' ? 24 : 20}
                color={primaryColor}
              />
            </ThemedView>
          )}
        </ThemedView>
        
        {trend !== undefined && (
          <ThemedView style={[styles.trendContainer, { backgroundColor: getTrendColor(trend) + '20' }]}>
            <IconSymbol
              name={getTrendIcon(trend)}
              size={12}
              color={getTrendColor(trend)}
            />
            <ThemedText
              type="caption"
              style={[styles.trendText, { color: getTrendColor(trend) }]}
            >
              {Math.abs(trend)}%
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Value */}
      <ThemedView style={styles.valueContainer}>
        <ThemedText
          type={size === 'large' ? 'display' : size === 'small' ? 'metric' : 'metric'}
          style={[styles.value, { color: primaryColor }]}
        >
          {formatValue(value)}
        </ThemedText>
      </ThemedView>

      {/* Title and Subtitle */}
      <ThemedView style={styles.footer}>
        <ThemedText
          type={size === 'small' ? 'caption' : 'defaultSemiBold'}
          variant="secondary"
          style={styles.title}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            type="caption"
            variant="muted"
            style={styles.subtitle}
          >
            {subtitle}
          </ThemedText>
        )}
      </ThemedView>

      {/* Gradient Overlay for Premium Look */}
      {showGlow && (
        <Animated.View style={[StyleSheet.absoluteFillObject, animatedGlowStyle]}>
          <LinearGradient
            colors={[primaryColor + '05', 'transparent', primaryColor + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
    </ThemedView>
  );

  if (interactive) {
    return (
      <Animated.View
        entering={animated ? FadeInDown.delay(delay) : undefined}
        style={[styles.container, animatedStyle]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ 
            color: primaryColor + '20', 
            borderless: false,
            radius: 60
          }}
          style={styles.pressable}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={animated ? FadeInDown.delay(delay) : undefined}
      style={styles.container}
    >
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  pressable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#0F0A1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  value: {
    lineHeight: undefined, // Let the text type handle line height
    letterSpacing: -1,
  },
  footer: {
    gap: 2,
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 10,
    opacity: 0.8,
  },
});

export default MetricsCard;