import { BodyText, CaptionText, HeroText, LabelText, ThemedButton, ThemedText, ThemedView, TitleText } from '@/components/ui';
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

// Responsive utilities (duplicate from ThemedText for standalone use)
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size: number): number {
  const newSize = size * scale;
  if (SCREEN_WIDTH <= 320) return Math.max(newSize * 0.9, size * 0.85);
  if (SCREEN_WIDTH >= 768) return Math.min(newSize * 1.1, size * 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onNext?: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  // Animation values
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const waveOpacity = useSharedValue(0);
  const featureOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    // Entrance animations
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );
    
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    waveOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    featureOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(1200, withTiming(0, { duration: 500 }));
    
    // Continuous pulse animation for logo
    const startPulse = () => {
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      );
    };
    
    const timeout = setTimeout(() => {
      const interval = setInterval(startPulse, 4000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);
  
  const handleGetStarted = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNext?.();
  };
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
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
  
  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
  }));
  
  const featureAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featureOpacity.value,
  }));
  
  const logoWithPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Hero Visual */}
      <ThemedView style={styles.heroSection}>
        <Animated.View style={[styles.logoContainer, { borderColor: primaryColor }, logoWithPulseStyle]}>
          <ThemedText style={[styles.logoText, { color: primaryColor }]}>
            🌙
          </ThemedText>
        </Animated.View>
        
        <Animated.View style={titleAnimatedStyle}>
          <HeroText style={styles.appName}>
            Lunar
          </HeroText>
        </Animated.View>
        
        <Animated.View style={contentAnimatedStyle}>
          <TitleText style={styles.tagline}>
            AI-Powered Sleep Intelligence
          </TitleText>
          
          <BodyText style={styles.description}>
            Transform your nights into insights. Discover your sleep patterns, 
            optimize your rest, and wake up to a better you.
          </BodyText>
        </Animated.View>
      </ThemedView>

      {/* Visual Elements */}
      <Animated.View style={[styles.visualSection, waveAnimatedStyle]}>
        <ThemedView style={[styles.sleepWave, { backgroundColor: primaryColor + '20' }]} />
        <ThemedView style={[styles.sleepWave, styles.sleepWave2, { backgroundColor: primaryColor + '15' }]} />
        <ThemedView style={[styles.sleepWave, styles.sleepWave3, { backgroundColor: primaryColor + '10' }]} />
      </Animated.View>

      {/* Key Features Preview */}
      <Animated.View style={[styles.featuresPreview, featureAnimatedStyle]}>
        <ThemedView style={styles.featureRow}>
          <ThemedView style={[styles.featureDot, { backgroundColor: Colors.semantic.success }]} />
          <LabelText style={styles.featureText}>
            100% Free Forever
          </LabelText>
        </ThemedView>
        
        <ThemedView style={styles.featureRow}>
          <ThemedView style={[styles.featureDot, { backgroundColor: primaryColor }]} />
          <LabelText style={styles.featureText}>
            Privacy-First Design
          </LabelText>
        </ThemedView>
        
        <ThemedView style={styles.featureRow}>
          <ThemedView style={[styles.featureDot, { backgroundColor: Colors.sleepStages.wake }]} />
          <LabelText style={styles.featureText}>
            AI Sleep Analysis
          </LabelText>
        </ThemedView>
      </Animated.View>

      {/* Call to Action */}
      <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
        <ThemedButton 
          variant="sleep-action" 
          size="lg" 
          fullWidth
          onPress={handleGetStarted}
        >
          Get Started
        </ThemedButton>
        
        <CaptionText style={styles.setupTime}>
          Complete setup in about 5 minutes for personalized insights
        </CaptionText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  heroSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: normalize(40),
  },
  appName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  visualSection: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  sleepWave: {
    position: 'absolute',
    width: width * 0.8,
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  sleepWave2: {
    width: width * 0.6,
    height: 40,
    marginTop: -20,
    opacity: 0.4,
  },
  sleepWave3: {
    width: width * 0.4,
    height: 20,
    marginTop: -40,
    opacity: 0.2,
  },
  featuresPreview: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    opacity: 0.8,
    flex: 1,
  },
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 16,
  },
  setupTime: {
    textAlign: 'center',
    opacity: 0.6,
  },
});