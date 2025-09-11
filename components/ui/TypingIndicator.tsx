import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TypingIndicatorProps {
  isVisible: boolean;
  aiName?: string;
}

export const TypingIndicator = memo(function TypingIndicator({ isVisible, aiName = 'Sleep Coach' }: TypingIndicatorProps) {
  const colorScheme = useColorScheme();
  
  // Reduced animation complexity for better mobile performance
  const dot1Animation = useRef(new Animated.Value(0)).current;
  const dot2Animation = useRef(new Animated.Value(0)).current;
  const dot3Animation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(-20)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  
  const tintColor = useThemeColor({}, 'tint') as string;
  const textColor = useThemeColor({}, 'text') as string;

  useEffect(() => {
    if (isVisible) {
      // Optimized entrance animation
      const animationDuration = Platform.OS === 'ios' ? 300 : 200;
      
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: animationDuration + 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Simplified dot animation for better performance
      const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600, // Reduced duration
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(150), // Reduced delay
          ])
        );
      };

      const dot1Anim = createDotAnimation(dot1Animation, 0);
      const dot2Anim = createDotAnimation(dot2Animation, 150); // Reduced delay
      const dot3Anim = createDotAnimation(dot3Animation, 300);

      dot1Anim.start();
      dot2Anim.start();
      dot3Anim.start();

      return () => {
        dot1Anim.stop();
        dot2Anim.stop();
        dot3Anim.stop();
      };
    } else {
      // Quick exit
      slideAnimation.setValue(-20);
      opacityAnimation.setValue(0);
    }
  }, [isVisible, slideAnimation, opacityAnimation, dot1Animation, dot2Animation, dot3Animation]);

  if (!isVisible) return null;

  const getDotStyle = (animatedValue: Animated.Value, index: number) => {
    const sleepColors = [
      colorScheme === 'dark' ? '#8B5CF6' : '#5B21B6',  // Deep sleep
      colorScheme === 'dark' ? '#A78BFA' : '#7C3AED',  // REM sleep
      colorScheme === 'dark' ? '#C4B5FD' : '#9333EA',  // Light sleep
    ];
    
    return {
      opacity: animatedValue.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0.3, 0.7, 1],
      }),
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0.8, 1.1, 1.4],
          }),
        },
        {
          translateY: animatedValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, -4, -8],
          }),
        },
      ],
      backgroundColor: sleepColors[index],
      shadowColor: sleepColors[index],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
      shadowRadius: 4,
      elevation: 3,
    };
  };
  
  const getGradientColors = () => {
    return colorScheme === 'dark'
      ? ['rgba(30, 27, 60, 0.98)', 'rgba(45, 27, 105, 0.95)', 'rgba(139, 92, 246, 0.1)']
      : ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)', 'rgba(91, 33, 182, 0.05)'];
  };
  
  const getBorderColor = () => {
    return colorScheme === 'dark'
      ? 'rgba(139, 92, 246, 0.25)'
      : 'rgba(226, 232, 240, 0.8)';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnimation }],
          opacity: opacityAnimation,
        },
      ]}
      accessible={true}
      accessibilityLabel={`${aiName} is typing a response`}
      accessibilityLiveRegion="polite"
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.bubble,
          {
            borderWidth: 1.5,
            borderColor: getBorderColor(),
            ...Platform.select({
              ios: {
                shadowColor: tintColor + '40',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
      >
        {/* Enhanced AI coach header */}
        <View style={styles.header}>
          <View style={[
            styles.aiAvatarContainer,
            { backgroundColor: (tintColor as string) + '20' }
          ]}>
            <LinearGradient
              colors={[(tintColor as string) + '80', tintColor as string]}
              style={styles.aiAvatar}
            >
              <IconSymbol
                size={12}
                color="white"
                name="moon.stars.fill"
              />
            </LinearGradient>
          </View>
          
          <View style={styles.aiInfo}>
            <ThemedText 
              type="caption" 
              style={[
                styles.aiName,
                { color: textColor, fontWeight: '600' }
              ]}
              accessible={false}
            >
              {aiName}
            </ThemedText>
            <ThemedText 
              type="caption" 
              variant="muted" 
              style={styles.aiStatus}
              accessible={false}
            >
              analyzing your sleep...
            </ThemedText>
          </View>
        </View>
        
        {/* Enhanced typing dots with sleep theme */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              getDotStyle(dot1Animation, 0),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              getDotStyle(dot2Animation, 1),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              getDotStyle(dot3Animation, 2),
            ]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: screenWidth * 0.75,
    minWidth: 140,
    marginBottom: 24,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    zIndex: -1,
  },
  bubble: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderTopLeftRadius: 10,
    minHeight: 76,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInfo: {
    marginLeft: 8,
    flex: 1,
  },
  aiName: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiStatus: {
    fontSize: 10,
    lineHeight: 12,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});