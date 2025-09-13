import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LabelText, RangeSlider, ThemedView } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import { TRANSLATIONS } from './messages';
import { SleepDurationSliderProps } from './types';

export default function SleepDurationSlider({
  language,
  sleepDuration,
  onSleepDurationChange,
  tintColor,
  surfaceColor,
  borderColor,
  goalCardAnimatedStyle
}: SleepDurationSliderProps) {
  const t = TRANSLATIONS[language];

  return (
    <Animated.View entering={FadeIn.delay(300)} style={goalCardAnimatedStyle}>
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
        <LabelText style={styles.sectionTitle}>{t.targetSleepDuration}</LabelText>
        <RangeSlider
          min={5}
          max={12}
          value={sleepDuration}
          onChange={onSleepDurationChange}
          step={0.5}
          unit=" hrs"
          showValue={true}
          minimumTrackTintColor={tintColor}
        />
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.lg,
    borderWidth: 1,
    ...DesignTokens.shadows.soft,
  },
  sectionTitle: {
    marginBottom: DesignTokens.spacing.md,
    fontWeight: '600',
  },
});