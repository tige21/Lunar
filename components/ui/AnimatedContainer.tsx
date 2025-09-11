import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'spring';
  onAnimationComplete?: () => void;
}

export function AnimatedContainer({
  children,
  style,
  delay = 0,
  duration = 600,
  animation = 'fade',
  onAnimationComplete,
}: AnimatedContainerProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const animationConfig = {
      duration,
      easing: Easing.out(Easing.cubic),
    };

    const springConfig = {
      damping: 15,
      stiffness: 150,
      mass: 1,
    };

    // Set initial values based on animation type
    switch (animation) {
      case 'slideUp':
        translateY.value = 50;
        break;
      case 'slideDown':
        translateY.value = -50;
        break;
      case 'slideLeft':
        translateX.value = 50;
        break;
      case 'slideRight':
        translateX.value = -50;
        break;
      case 'scale':
        scale.value = 0.8;
        break;
    }

    // Animate to final values
    const animate = () => {
      opacity.value = withTiming(1, animationConfig);
      
      if (animation === 'spring') {
        translateY.value = withSpring(0, springConfig);
        scale.value = withSpring(1, springConfig);
      } else {
        translateY.value = withTiming(0, animationConfig);
        translateX.value = withTiming(0, animationConfig);
        scale.value = withTiming(1, animationConfig);
      }

      if (onAnimationComplete) {
        // Call completion callback after animation finishes
        setTimeout(() => runOnJS(onAnimationComplete)(), duration + delay);
      }
    };

    if (delay > 0) {
      setTimeout(animate, delay);
    } else {
      animate();
    }
  }, [animation, delay, duration, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default AnimatedContainer;