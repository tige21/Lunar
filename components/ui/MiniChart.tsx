/**
 * Enhanced Mini Chart Component
 * Sophisticated micro-visualizations for sleep data with smooth animations
 * and mobile-optimized interactions
 */

import React, { useState, useEffect, memo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface MiniChartProps {
  data: number[];
  height?: number;
  barWidth?: number;
  barGap?: number;
  getBarColor?: (value: number, index: number) => string;
  maxValue?: number;
  interactive?: boolean;
  onBarPress?: (value: number, index: number) => void;
  animated?: boolean;
  showGradient?: boolean;
  showTrend?: boolean;
  chartType?: 'bar' | 'line' | 'area';
  cornerRadius?: number;
  pulseOnHover?: boolean;
}

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  color: string;
  showGradient?: boolean;
  strokeWidth?: number;
  animated?: boolean;
}

const DEFAULT_BAR_COLOR = '#5B21B6';
const { width: screenWidth } = Dimensions.get('window');

const getScoreColor = (score: number, index: number = 0) => {
  if (score >= 80) return Colors.semantic.success;
  if (score >= 60) return Colors.semantic.warning;
  if (score >= 40) return Colors.semantic.error;
  return Colors.sleepStages.deep;
};

const getSleepStageColor = (value: number, index: number) => {
  const colors = [Colors.sleepStages.deep, Colors.sleepStages.rem, Colors.sleepStages.light, Colors.sleepStages.wake];
  return colors[index % colors.length];
};

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 85) return Colors.semantic.success;
  if (efficiency >= 75) return Colors.semantic.warning;
  return Colors.semantic.error;
};

// Sparkline Component for Line Charts
export function Sparkline({
  data,
  width,
  height,
  color,
  showGradient = true,
  strokeWidth = 2,
  animated = true
}: SparklineProps) {
  const pathValue = useSharedValue('');
  const gradientOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (data.length < 2) return;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y };
    });
    
    const pathString = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    
    if (animated) {
      pathValue.value = withTiming(pathString, { duration: 800 });
      gradientOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    } else {
      pathValue.value = pathString;
      gradientOpacity.value = 1;
    }
  }, [data, width, height, animated]);
  
  // For now, return a simple line representation using bars
  // In a full implementation, you'd use react-native-svg
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  return (
    <View style={[styles.sparklineContainer, { width, height }]}>
      {data.map((value, index) => {
        const barHeight = Math.max(((value - minValue) / range) * height, 2);
        const x = (index / (data.length - 1)) * width;
        
        return (
          <Animated.View
            key={index}
            entering={animated ? FadeInUp.delay(index * 50) : undefined}
            style={[
              styles.sparklinePoint,
              {
                position: 'absolute',
                left: x - 1,
                bottom: 0,
                width: 2,
                height: barHeight,
                backgroundColor: color,
                opacity: 0.8
              }
            ]}
          />
        );
      })}
    </View>
  );
}

export const MiniChart = memo(function MiniChart({
  data,
  height = 50,
  barWidth = 6,
  barGap = 4,
  getBarColor = getScoreColor,
  maxValue,
  interactive = false,
  onBarPress,
  animated = true,
  showGradient = false,
  showTrend = false,
  chartType = 'bar',
  cornerRadius = 3,
  pulseOnHover = true
}: MiniChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = maxValue || Math.max(...data);
  const min = Math.min(...data);
  const totalWidth = data.length * (barWidth + barGap) - barGap;
  const pulseAnimation = useSharedValue(1);
  const trendAnimation = useSharedValue(0);
  
  useEffect(() => {
    if (showTrend && animated) {
      trendAnimation.value = withDelay(200, withTiming(1, { duration: 1000 }));
    }
  }, [showTrend, animated]);
  
  const handleBarPress = (value: number, index: number) => {
    if (interactive) {
      setSelectedIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onBarPress?.(value, index);
      
      // Reset selection after a short delay
      setTimeout(() => setSelectedIndex(null), 1500);
    }
  };
  
  // Calculate trend direction
  const trendDirection = data.length > 1 ? 
    (data[data.length - 1] - data[0] > 0 ? 'up' : data[data.length - 1] - data[0] < 0 ? 'down' : 'flat') : 'flat';
  
  if (chartType === 'line') {
    return (
      <Sparkline
        data={data}
        width={totalWidth}
        height={height}
        color={getBarColor(data[0] || 0, 0)}
        showGradient={showGradient}
        animated={animated}
      />
    );
  }
  
  return (
    <View style={[styles.container, { height, width: totalWidth }]}>
      {/* Trend Indicator */}
      {showTrend && (
        <Animated.View 
          style={[
            styles.trendIndicator,
            {
              backgroundColor: trendDirection === 'up' ? Colors.semantic.success : 
                              trendDirection === 'down' ? Colors.semantic.error : 
                              Colors.semantic.info,
              opacity: trendAnimation
            }
          ]}
        >
          {/* Simple trend arrow using text - in production use IconSymbol */}
        </Animated.View>
      )}
      
      {data.map((value, index) => {
        const barHeight = max > 0 ? (value / max) * height : height * 0.1;
        const color = getBarColor(value, index);
        const isSelected = selectedIndex === index;
        
        const AnimatedBar = ({ children }: { children: React.ReactNode }) => {
          const scaleYValue = useSharedValue(0);
          const scaleXValue = useSharedValue(1);
          const opacityValue = useSharedValue(1);
          const glowValue = useSharedValue(0);
          
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [
                { scaleY: scaleYValue.value },
                { scaleX: scaleXValue.value }
              ],
              opacity: opacityValue.value,
              shadowOpacity: glowValue.value * 0.3,
              shadowRadius: interpolate(glowValue.value, [0, 1], [0, 8], Extrapolate.CLAMP),
              shadowOffset: { width: 0, height: interpolate(glowValue.value, [0, 1], [0, 4], Extrapolate.CLAMP) },
              elevation: interpolate(glowValue.value, [0, 1], [1, 4], Extrapolate.CLAMP)
            };
          });
          
          React.useEffect(() => {
            if (animated) {
              scaleYValue.value = withDelay(
                index * 50,
                withSpring(1, { damping: 12, stiffness: 200 })
              );
            } else {
              scaleYValue.value = 1;
            }
            
            if (isSelected) {
              scaleXValue.value = withSpring(1.2, { damping: 15 });
              glowValue.value = withSpring(1);
              opacityValue.value = withSequence(
                withSpring(0.7),
                withSpring(1)
              );
            } else {
              scaleXValue.value = withSpring(1);
              glowValue.value = withSpring(0);
            }
            
            if (pulseOnHover && hoverIndex === index) {
              pulseAnimation.value = withSequence(
                withSpring(1.1, { damping: 10 }),
                withSpring(1)
              );
            }
          }, [isSelected, hoverIndex]);
          
          return (
            <Animated.View style={[animatedStyle]}>
              {children}
            </Animated.View>
          );
        };
        
        const BarComponent = interactive ? Pressable : View;
        const barProps = interactive ? {
          onPress: () => handleBarPress(value, index),
          onPressIn: () => setHoverIndex(index),
          onPressOut: () => setHoverIndex(null),
          android_ripple: { color: `${color}40`, borderless: true }
        } : {};
        
        const barContent = showGradient ? (
          <LinearGradient
            colors={[color, color + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: Math.max(barHeight, 2),
                marginRight: index < data.length - 1 ? barGap : 0,
                borderRadius: cornerRadius,
                shadowColor: color,
              }
            ]}
          />
        ) : (
          <View
            style={[
              styles.bar,
              {
                width: barWidth,
                height: Math.max(barHeight, 2),
                backgroundColor: color,
                marginRight: index < data.length - 1 ? barGap : 0,
                borderRadius: cornerRadius,
                shadowColor: color,
              }
            ]}
          />
        );
        
        return (
          <AnimatedBar key={index}>
            <BarComponent {...barProps}>
              {barContent}
            </BarComponent>
          </AnimatedBar>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  bar: {
    minHeight: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  sparklineContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  sparklinePoint: {
    borderRadius: 1,
  },
  trendIndicator: {
    position: 'absolute',
    top: -8,
    right: 0,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
  },
});

// Additional chart types and utilities
export const MiniChartTypes = {
  bar: 'bar' as const,
  line: 'line' as const,
  area: 'area' as const,
};

export const MiniChartColorSchemes = {
  sleep: getSleepStageColor,
  score: getScoreColor,
  efficiency: getEfficiencyColor,
};

// Export default for easier imports
export default MiniChart;