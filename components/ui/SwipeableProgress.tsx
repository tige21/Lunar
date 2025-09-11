import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SwipeableProgressProps {
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
  animated?: boolean;
}

export function SwipeableProgress({
  currentStep,
  totalSteps,
  style,
  animated = true,
}: SwipeableProgressProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'surface');
  
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const targetProgress = (currentStep - 1) / (totalSteps - 1);
    
    if (animated) {
      progress.value = withSpring(targetProgress, {
        damping: 15,
        stiffness: 120,
        mass: 1,
      });
      
      // Add subtle scale animation on progress change
      scale.value = withTiming(1.02, { duration: 150 }, (finished) => {
        if (finished) {
          scale.value = withTiming(1, { duration: 150 });
        }
      });
    } else {
      progress.value = targetProgress;
    }
  }, [currentStep, totalSteps, animated]);

  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progress.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
      transform: [{ scale: scale.value }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Generate step indicators
  const stepIndicators = Array.from({ length: totalSteps }, (_, index) => {
    const stepNumber = index + 1;
    const isActive = stepNumber <= currentStep;
    
    return (
      <ThemedView
        key={index}
        style={[
          styles.stepIndicator,
          {
            backgroundColor: isActive ? primaryColor : backgroundColor,
            transform: [{ scale: isActive ? 1.1 : 1 }],
          },
        ]}
      />
    );
  });

  return (
    <Animated.View style={[styles.container, style, containerStyle]}>
      {/* Progress Bar */}
      <ThemedView style={[styles.progressTrack, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: primaryColor },
            progressBarStyle,
          ]}
        />
      </ThemedView>
      
      {/* Step Indicators */}
      <ThemedView style={styles.stepIndicators}>
        {stepIndicators}
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SwipeableProgress;