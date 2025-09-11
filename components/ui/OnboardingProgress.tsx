import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';

export interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: any;
  animated?: boolean;
}

export function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  style,
  animated = true,
}: OnboardingProgressProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  const progressPercentage = (currentStep / totalSteps) * 100;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progressPercentage / 100, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = progressPercentage / 100;
    }
  }, [currentStep, progressPercentage, animated]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  const AnimatedProgressBar = animated ? Animated.View : ThemedView;

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedView style={styles.progressTrack}>
        <AnimatedProgressBar
          style={[
            styles.progressFill,
            { backgroundColor: primaryColor },
            animated && animatedProgressStyle,
            !animated && { width: `${progressPercentage}%` },
          ]} 
        />
      </ThemedView>
      
      <ThemedView style={styles.dots}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep - 1;
          
          return (
            <AnimatedDot
              key={index}
              isCompleted={isCompleted}
              isActive={isActive}
              color={primaryColor}
              animated={animated}
            />
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

interface AnimatedDotProps {
  isCompleted: boolean;
  isActive: boolean;
  color: string;
  animated: boolean;
}

function AnimatedDot({ isCompleted, isActive, color, animated }: AnimatedDotProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (animated) {
      scale.value = withTiming(isCompleted || isActive ? 1 : 0.8, {
        duration: 300,
        easing: Easing.out(Easing.back()),
      });
      opacity.value = withTiming(isCompleted ? 1 : isActive ? 0.8 : 0.3, {
        duration: 300,
      });
    } else {
      scale.value = isCompleted || isActive ? 1 : 0.8;
      opacity.value = isCompleted ? 1 : isActive ? 0.8 : 0.3;
    }
  }, [isCompleted, isActive, animated]);

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const AnimatedDotView = animated ? Animated.View : ThemedView;

  return (
    <AnimatedDotView
      style={[
        styles.dot,
        {
          backgroundColor: color,
        },
        animated && animatedDotStyle,
        !animated && {
          opacity: isCompleted ? 1 : isActive ? 0.8 : 0.3,
          transform: [{ scale: isCompleted || isActive ? 1 : 0.8 }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});