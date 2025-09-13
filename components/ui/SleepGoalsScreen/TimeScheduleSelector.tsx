import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LabelText, ThemedView, TimePicker, TitleText } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import { TRANSLATIONS } from './messages';
import { TimeScheduleSelectorProps } from './types';

export default function TimeScheduleSelector({
  language,
  bedtime,
  wakeTime,
  onBedtimeChange,
  onWakeTimeChange,
  actualSleepTime,
  getQualityColor,
  surfaceColor,
  borderColor,
  timePickerAnimatedStyle
}: TimeScheduleSelectorProps) {
  const t = TRANSLATIONS[language];

  return (
    <Animated.View entering={FadeIn.delay(400)} style={timePickerAnimatedStyle}>
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
        <LabelText style={styles.sectionTitle}>{t.sleepSchedule}</LabelText>

        <ThemedView style={styles.timePickersContainer}>
          <ThemedView style={styles.timePickerRow}>
            <TimePicker
              label={t.bedtime}
              value={bedtime}
              onChange={onBedtimeChange}
              mode="12h"
            />
          </ThemedView>

          <ThemedView style={styles.timePickerRow}>
            <TimePicker
              label={t.wakeTime}
              value={wakeTime}
              onChange={onWakeTimeChange}
              mode="12h"
            />
          </ThemedView>
        </ThemedView>

        {/* Sleep Duration Display */}
        <ThemedView style={[styles.durationDisplay, { borderColor: getQualityColor() }]}>
          <LabelText style={styles.durationLabel}>
            {t.actualSleepTime}
          </LabelText>
          <TitleText style={[styles.durationValue, { color: getQualityColor() }]}>
            {actualSleepTime} {language === 'ru' ? 'часов' : 'hours'}
          </TitleText>
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
  timePickersContainer: {
    gap: DesignTokens.spacing.md,
  },
  timePickerRow: {
    // Individual time picker styling handled by TimePicker component
  },
  durationDisplay: {
    marginTop: DesignTokens.spacing.lg,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  durationLabel: {
    marginBottom: DesignTokens.spacing.xs,
    opacity: 0.8,
  },
  durationValue: {
    fontSize: DesignTokens.fontSize['2xl'],
    fontWeight: 'bold',
  },
});