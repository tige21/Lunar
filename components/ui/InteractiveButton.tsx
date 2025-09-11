import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { ThemedButton } from '../ThemedButton';

interface InteractiveButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'sleep-action' | 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  animationType?: 'scale' | 'bounce' | 'press' | 'subtle';
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  disabled?: boolean;
}

export function InteractiveButton({
  children,
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  style,
  animationType = 'scale',
  hapticFeedback = 'light',
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: InteractiveButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const triggerHapticFeedback = () => {
    if (Platform.OS === 'ios' && hapticFeedback !== 'none') {
      switch (hapticFeedback) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
      }
    }
  };

  const handlePressIn = (event: any) => {
    if (disabled) return;
    
    const springConfig = {
      damping: 15,
      stiffness: 300,
      mass: 1,
    };

    switch (animationType) {
      case 'scale':
        scale.value = withSpring(0.95, springConfig);
        break;
      case 'bounce':
        scale.value = withSpring(0.92, springConfig);
        break;
      case 'press':
        translateY.value = withTiming(2, { duration: 100 });
        opacity.value = withTiming(0.8, { duration: 100 });
        break;
      case 'subtle':
        scale.value = withSpring(0.98, springConfig);
        opacity.value = withTiming(0.9, { duration: 150 });
        break;
    }

    runOnJS(triggerHapticFeedback)();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (disabled) return;

    const springConfig = {
      damping: 12,
      stiffness: 200,
      mass: 1,
    };

    switch (animationType) {
      case 'scale':
        scale.value = withSpring(1, springConfig);
        break;
      case 'bounce':
        scale.value = withSpring(1.02, springConfig, (finished) => {
          if (finished) {
            scale.value = withSpring(1, springConfig);
          }
        });
        break;
      case 'press':
        translateY.value = withTiming(0, { duration: 150 });
        opacity.value = withTiming(1, { duration: 150 });
        break;
      case 'subtle':
        scale.value = withSpring(1, springConfig);
        opacity.value = withTiming(1, { duration: 200 });
        break;
    }

    onPressOut?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...props}
      >
        <ThemedButton
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
        >
          {children}
        </ThemedButton>
      </Pressable>
    </Animated.View>
  );
}

export default InteractiveButton;