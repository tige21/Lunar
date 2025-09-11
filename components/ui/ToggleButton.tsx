import React from 'react';
import {
  StyleSheet,
  Pressable,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ToggleButtonProps = PressableProps & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'switch' | 'button';
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
};

const SWITCH_SIZES = {
  small: { width: 44, height: 24, thumbSize: 20 },
  medium: { width: 52, height: 28, thumbSize: 24 },
  large: { width: 60, height: 32, thumbSize: 28 },
};

export function ToggleButton({
  value,
  onValueChange,
  label,
  size = 'medium',
  variant = 'switch',
  activeColor,
  inactiveColor,
  disabled = false,
  style,
  ...rest
}: ToggleButtonProps) {
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value, progress]);

  const getActiveColor = () => activeColor || tintColor;
  const getInactiveColor = () => inactiveColor || borderColor;

  // Move animated styles to top level
  const { width, height, thumbSize } = SWITCH_SIZES[size];
  const thumbOffset = 2;
  const maxThumbPosition = width - thumbSize - thumbOffset * 2;

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [getInactiveColor(), getActiveColor()]
    );
    return { backgroundColor };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = progress.value * maxThumbPosition;
    return { transform: [{ translateX }] };
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  if (variant === 'button') {
    return (
      <Pressable
        style={[
          styles.buttonContainer,
          {
            backgroundColor: value ? getActiveColor() : surfaceColor,
            borderColor: value ? getActiveColor() : borderColor,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        {...rest}
      >
        {label && (
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.buttonLabel,
              {
                color: value ? '#FFFFFF' : textColor,
              },
            ]}
          >
            {label}
          </ThemedText>
        )}
      </Pressable>
    );
  }

  // Switch variant - use the already defined styles

  return (
    <ThemedView style={styles.switchContainer}>
      <Pressable
        style={[
          styles.switch,
          {
            width: width,
            height: height,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        {...rest}
      >
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                top: thumbOffset,
                left: thumbOffset,
              },
              thumbStyle,
            ]}
          />
        </Animated.View>
      </Pressable>

      {label && (
        <ThemedText
          type="default"
          style={[
            styles.switchLabel,
            {
              color: disabled ? `${textColor}80` : textColor,
            },
          ]}
        >
          {label}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switch: {
    borderRadius: 100,
    justifyContent: 'center',
  },
  track: {
    flex: 1,
    borderRadius: 100,
    position: 'relative',
  },
  thumb: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchLabel: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    // Label styles handled inline
  },
});