import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type LoadingStateProps = {
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'sleep-wave' | 'dots';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  color?: string;
};

export function LoadingState({
  variant = 'spinner',
  size = 'medium',
  message,
  color,
}: LoadingStateProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const loadingColor = color || tintColor;

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { size: 24, fontSize: 14 };
      case 'large':
        return { size: 64, fontSize: 18 };
      default:
        return { size: 36, fontSize: 16 };
    }
  };

  const { size: componentSize, fontSize } = getSizes();

  if (variant === 'spinner') {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'large'}
          color={loadingColor}
        />
        {message && (
          <ThemedText
            type="caption"
            style={[styles.message, { fontSize }]}
          >
            {message}
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  if (variant === 'pulse') {
    return <PulseLoader color={loadingColor} size={componentSize} message={message} />;
  }

  if (variant === 'skeleton') {
    return <SkeletonLoader />;
  }

  if (variant === 'sleep-wave') {
    return <SleepWaveLoader color={loadingColor} message={message} />;
  }

  if (variant === 'dots') {
    return <DotsLoader color={loadingColor} size={componentSize} message={message} />;
  }

  return null;
}

// Pulse Loader Component
function PulseLoader({ color, size, message }: { color: string; size: number; message?: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [1, 1.2], [0.5, 0.8]),
  }));

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={[
          styles.pulseCircle,
          { backgroundColor: color, width: size, height: size },
          animatedStyle,
        ]}
      />
      {message && (
        <ThemedText type="caption" style={styles.message}>
          {message}
        </ThemedText>
      )}
    </ThemedView>
  );
}

// Skeleton Loader Component
function SkeletonLoader() {
  const opacity = useSharedValue(0.5);
  const borderColor = useThemeColor({}, 'border');

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView style={styles.skeletonContainer}>
      <Animated.View
        style={[
          styles.skeletonLine,
          styles.skeletonTitle,
          { backgroundColor: borderColor },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          styles.skeletonSubtitle,
          { backgroundColor: borderColor },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          styles.skeletonContent,
          { backgroundColor: borderColor },
          animatedStyle,
        ]}
      />
    </ThemedView>
  );
}

// Sleep Wave Loader Component
function SleepWaveLoader({ color, message }: { color: string; message?: string }) {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  React.useEffect(() => {
    const animateWave = (sharedValue: any, delay: number) => {
      sharedValue.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sine) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        false
      );
    };

    animateWave(wave1, 0);
    animateWave(wave2, 200);
    animateWave(wave3, 400);
  }, []);

  const createWaveStyle = (waveValue: any) =>
    useAnimatedStyle(() => ({
      transform: [{ scaleY: interpolate(waveValue.value, [0, 1], [0.3, 1]) }],
      opacity: interpolate(waveValue.value, [0, 1], [0.4, 1]),
    }));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.waveContainer}>
        <Animated.View
          style={[styles.wave, { backgroundColor: color }, createWaveStyle(wave1)]}
        />
        <Animated.View
          style={[styles.wave, { backgroundColor: color }, createWaveStyle(wave2)]}
        />
        <Animated.View
          style={[styles.wave, { backgroundColor: color }, createWaveStyle(wave3)]}
        />
      </ThemedView>
      {message && (
        <ThemedText type="caption" style={styles.message}>
          {message}
        </ThemedText>
      )}
    </ThemedView>
  );
}

// Dots Loader Component
function DotsLoader({ color, size, message }: { color: string; size: number; message?: string }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    const animateDot = (sharedValue: any, delay: number) => {
      sharedValue.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1,
        false
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const createDotStyle = (dotValue: any) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(dotValue.value, [0, 1], [0.3, 1]),
      transform: [{ scale: interpolate(dotValue.value, [0, 1], [0.8, 1]) }],
    }));

  const dotSize = size / 4;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, width: dotSize, height: dotSize },
            createDotStyle(dot1),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, width: dotSize, height: dotSize },
            createDotStyle(dot2),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, width: dotSize, height: dotSize },
            createDotStyle(dot3),
          ]}
        />
      </ThemedView>
      {message && (
        <ThemedText type="caption" style={styles.message}>
          {message}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  pulseCircle: {
    borderRadius: 100,
  },
  skeletonContainer: {
    padding: 20,
    width: '100%',
  },
  skeletonLine: {
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 16,
    width: '40%',
  },
  skeletonContent: {
    height: 12,
    width: '80%',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wave: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 100,
  },
});