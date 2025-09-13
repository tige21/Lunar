import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BodyText, LabelText, ThemedView } from '@/components/ui';
import { Colors, DesignTokens } from '@/constants/Colors';
import { TRANSLATIONS } from './messages';
import { SleepSchedulePreviewProps } from './types';

export default function SleepSchedulePreview({
  language,
  bedtime,
  wakeTime,
  formatTime,
  surfaceColor,
  borderColor,
  goalCardAnimatedStyle
}: SleepSchedulePreviewProps) {
  const t = TRANSLATIONS[language];

  return (
    <Animated.View entering={FadeIn.delay(500)} style={goalCardAnimatedStyle}>
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
        <LabelText style={styles.sectionTitle}>{t.yourSleepSchedule}</LabelText>

        <ThemedView style={styles.schedulePreview}>
          <ThemedView style={styles.scheduleItem}>
            <BodyText style={styles.scheduleLabel}>{t.bedtimeLabel}</BodyText>
            <BodyText style={styles.scheduleTime}>{formatTime(bedtime)}</BodyText>
          </ThemedView>

          <ThemedView style={[styles.sleepBar, { backgroundColor: Colors.sleepStages.deep }]} />

          <ThemedView style={styles.scheduleItem}>
            <BodyText style={styles.scheduleLabel}>{t.wakeTimeLabel}</BodyText>
            <BodyText style={styles.scheduleTime}>{formatTime(wakeTime)}</BodyText>
          </ThemedView>
        </ThemedView>
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
  schedulePreview: {
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: DesignTokens.spacing.md,
  },
  scheduleLabel: {
    fontSize: DesignTokens.fontSize.lg,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: DesignTokens.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  sleepBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    marginVertical: DesignTokens.spacing.sm,
  },
});