import { BodyText, HeroText, ThemedText, ThemedView, TitleText } from '@/components/ui';
import React, { useMemo } from 'react';
import { Dimensions, PixelRatio, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { TRANSLATIONS } from './messages';
import { WelcomeHeroProps } from './types';

// Responsive utilities
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size: number): number {
  const newSize = size * scale;
  if (SCREEN_WIDTH <= 320) return Math.max(newSize * 0.9, size * 0.85);
  if (SCREEN_WIDTH >= 768) return Math.min(newSize * 1.1, size * 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function WelcomeHero({
  language,
  primaryColor,
  pulseScale,
  logoScale,
  titleOpacity,
  contentOpacity
}: WelcomeHeroProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const logoWithPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <ThemedView style={styles.heroSection}>
      <Animated.View style={[styles.logoContainer, { borderColor: primaryColor }, logoWithPulseStyle]}>
        <ThemedText style={[styles.logoText, { color: primaryColor }]}>
          🌙
        </ThemedText>
      </Animated.View>

      <Animated.View style={titleAnimatedStyle}>
        <HeroText style={styles.appName}>
          {t.appName}
        </HeroText>
      </Animated.View>

      <Animated.View style={contentAnimatedStyle}>
        <TitleText style={styles.tagline}>
          {t.tagline}
        </TitleText>

        <BodyText style={styles.description}>
          {t.description}
        </BodyText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 10,
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
    paddingHorizontal: 5,
    paddingBottom: 16,
  },
});