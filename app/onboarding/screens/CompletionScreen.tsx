import { BodyText, CaptionText, ThemedButton, ThemedText, ThemedView, TitleText } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, PixelRatio, Platform, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

// Responsive utilities
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size: number): number {
  const newSize = size * scale;
  if (SCREEN_WIDTH <= 320) return Math.max(newSize * 0.9, size * 0.85);
  if (SCREEN_WIDTH >= 768) return Math.min(newSize * 1.1, size * 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

interface CompletionScreenProps {
  onComplete?: () => void;
}

export default function CompletionScreen({ onComplete }: CompletionScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');
  
  // Animation values
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);

  useEffect(() => {
    // Celebration haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Success icon animation
    successScale.value = withSequence(
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 300 })
    );
    successOpacity.value = withTiming(1, { duration: 600 });
    
    // Content animations
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    buttonTranslateY.value = withDelay(1000, withTiming(0, { duration: 500 }));
  }, []);
  
  const handleStartTracking = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onComplete?.();
  };
  
  // Animated styles
  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));
  
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));
  
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Success Animation */}
      <ThemedView style={styles.successSection}>
        <Animated.View style={[styles.successIcon, { backgroundColor: Colors.semantic.success + '20' }, successAnimatedStyle]}>
          <ThemedText style={[styles.successEmoji, { color: Colors.semantic.success }]}>
            ✅
          </ThemedText>
        </Animated.View>
        
        <Animated.View style={titleAnimatedStyle}>
          <TitleText style={styles.successTitle}>
            Setup Complete!
          </TitleText>
        </Animated.View>
        
        <Animated.View style={contentAnimatedStyle}>
          <BodyText style={styles.successDescription}>
            Congratulations! You've completed the comprehensive Lunar setup. 
            Your personalized sleep intelligence system is now ready to help you achieve better rest.
          </BodyText>
        </Animated.View>
      </ThemedView>

      {/* Call to Action */}
      <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
        <ThemedButton 
          variant="primary" 
          size="xl" 
          fullWidth
          onPress={handleStartTracking}
        >
          Start Tracking My Sleep
        </ThemedButton>
        
        <CaptionText style={styles.encouragement}>
          Sweet dreams! We're here to help you sleep better every night. 🌙
        </CaptionText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  successSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: normalize(40),
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successDescription: {
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    gap: 16,
  },
  encouragement: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});