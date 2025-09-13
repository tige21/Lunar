import React, { useMemo } from 'react';
import { StyleSheet, Dimensions, PixelRatio } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedView, ThemedText, TitleText, BodyText } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { CompletionSuccessProps } from './types';
import { TRANSLATIONS } from './messages';

// Responsive utilities
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size: number): number {
  const newSize = size * scale;
  if (SCREEN_WIDTH <= 320) return Math.max(newSize * 0.9, size * 0.85);
  if (SCREEN_WIDTH >= 768) return Math.min(newSize * 1.1, size * 1.25);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function CompletionSuccess({
  language,
  successScale,
  successOpacity,
  titleOpacity,
  contentOpacity
}: CompletionSuccessProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

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

  return (
    <ThemedView style={styles.successSection}>
      <Animated.View style={[styles.successIcon, { backgroundColor: Colors.semantic.success + '20' }, successAnimatedStyle]}>
        <ThemedText style={[styles.successEmoji, { color: Colors.semantic.success }]}>
          ✅
        </ThemedText>
      </Animated.View>

      <Animated.View style={titleAnimatedStyle}>
        <TitleText style={styles.successTitle}>
          {t.title}
        </TitleText>
      </Animated.View>

      <Animated.View style={contentAnimatedStyle}>
        <BodyText style={styles.successDescription}>
          {t.description}
        </BodyText>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
});