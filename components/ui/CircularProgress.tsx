/**
 * Circular Progress Component
 * Animated circular progress indicator for sleep scores
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  withSpring
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animate?: boolean;
  duration?: number;
  onPress?: () => void;
  interactive?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularProgress({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#5B21B6',
  backgroundColor = '#F3F4F6',
  children,
  animate = true,
  duration = 1500,
  onPress,
  interactive = false
}: CircularProgressProps) {
  const animatedValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const glowValue = useSharedValue(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (animate) {
      animatedValue.value = withTiming(progress / 100, {
        duration,
        easing: Easing.out(Easing.cubic)
      });
      // Add subtle glow animation
      glowValue.value = withTiming(1, {
        duration: duration * 0.8
      });
    } else {
      animatedValue.value = progress / 100;
      glowValue.value = 1;
    }
  }, [progress, animate, duration]);
  
  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = interpolate(
      animatedValue.value,
      [0, 1],
      [circumference, 0]
    );
    
    return {
      strokeDashoffset
    };
  });
  
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      shadowOpacity: interpolate(
        glowValue.value,
        [0, 1],
        [0, 0.15]
      )
    };
  });
  
  const handlePressIn = () => {
    if (interactive || onPress) {
      scaleValue.value = withSpring(0.95, {
        damping: 15,
        stiffness: 300
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handlePressOut = () => {
    if (interactive || onPress) {
      scaleValue.value = withSpring(1, {
        damping: 15,
        stiffness: 300
      });
    }
  };
  
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };
  
  const Container = interactive || onPress ? Pressable : Animated.View;
  const containerProps = interactive || onPress ? {
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    onPress: handlePress,
    android_ripple: { color: `${color}20`, borderless: true }
  } : {};
  
  return (
    <Container 
      style={[styles.container, { width: size, height: size }, containerAnimatedStyle]} 
      {...containerProps}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={`${color}80`} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={animatedStyle}
        />
      </Svg>
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#5B21B6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 5,
  },
  svg: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});