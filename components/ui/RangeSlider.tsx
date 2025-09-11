import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  PanGestureHandler,
  State,
} from 'react-native';
import { PanGestureHandler as RNGHPanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type RangeSliderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
  trackColor?: string;
  thumbColor?: string;
  minimumTrackTintColor?: string;
};

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 4;

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  unit = '',
  showValue = true,
  disabled = false,
  trackColor,
  thumbColor,
  minimumTrackTintColor,
}: RangeSliderProps) {
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  
  const translateX = useSharedValue(0);
  const [currentValue, setCurrentValue] = useState(value);

  // Initialize slider position based on value
  React.useEffect(() => {
    const percentage = (value - min) / (max - min);
    translateX.value = percentage * (SLIDER_WIDTH - THUMB_SIZE);
  }, [value, min, max]);

  const updateValue = (newValue: number) => {
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    setCurrentValue(clampedValue);
    onChange(clampedValue);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newX = context.startX + event.translationX;
      const clampedX = Math.max(0, Math.min(SLIDER_WIDTH - THUMB_SIZE, newX));
      translateX.value = clampedX;

      // Calculate new value
      const percentage = clampedX / (SLIDER_WIDTH - THUMB_SIZE);
      const newValue = min + percentage * (max - min);
      runOnJS(updateValue)(newValue);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + THUMB_SIZE / 2,
    };
  });

  const getTrackColor = () => trackColor || borderColor;
  const getThumbColor = () => thumbColor || tintColor;
  const getMinimumTrackColor = () => minimumTrackTintColor || tintColor;

  return (
    <ThemedView style={styles.container}>
      {label && (
        <ThemedView style={styles.labelContainer}>
          <ThemedText type="label" style={styles.label}>
            {label}
          </ThemedText>
          {showValue && (
            <ThemedText type="defaultSemiBold" style={styles.value}>
              {currentValue}{unit}
            </ThemedText>
          )}
        </ThemedView>
      )}

      <ThemedView style={styles.sliderContainer}>
        {/* Background track */}
        <View
          style={[
            styles.track,
            styles.backgroundTrack,
            { backgroundColor: getTrackColor() },
          ]}
        />

        {/* Active track */}
        <Animated.View
          style={[
            styles.track,
            styles.activeTrack,
            { backgroundColor: getMinimumTrackColor() },
            trackStyle,
          ]}
        />

        {/* Thumb */}
        <RNGHPanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: getThumbColor(),
                opacity: disabled ? 0.6 : 1,
              },
              thumbStyle,
            ]}
          />
        </RNGHPanGestureHandler>
      </ThemedView>

      {/* Min/Max labels */}
      <ThemedView style={styles.minMaxContainer}>
        <ThemedText type="caption" style={styles.minMaxLabel}>
          {min}{unit}
        </ThemedText>
        <ThemedText type="caption" style={styles.minMaxLabel}>
          {max}{unit}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    flex: 1,
  },
  value: {
    color: Colors.light.tint,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    width: SLIDER_WIDTH,
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
  },
  backgroundTrack: {
    width: SLIDER_WIDTH,
    left: 0,
  },
  activeTrack: {
    left: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  minMaxLabel: {
    opacity: 0.7,
  },
});