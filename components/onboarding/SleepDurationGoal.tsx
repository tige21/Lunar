import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText, RangeSlider } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SleepDurationGoalProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

const SleepDurationGoal = memo(({ duration, onDurationChange }: SleepDurationGoalProps) => {
  const primaryColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Daily Sleep Goal
      </ThemedText>
      <ThemedText type="body" style={styles.sectionDescription}>
        How many hours of sleep do you want to get each night?
      </ThemedText>
      
      <ThemedView style={styles.durationContainer}>
        <ThemedText type="title" style={[styles.durationText, { color: primaryColor }]}>
          {duration} hours
        </ThemedText>
        <RangeSlider
          min={4}
          max={12}
          step={0.5}
          value={duration}
          onChange={onDurationChange}
          trackColor={primaryColor + '30'}
          thumbColor={primaryColor}
        />
        <ThemedView style={styles.durationLabels}>
          <ThemedText type="caption" style={styles.durationLabel}>4h</ThemedText>
          <ThemedText type="caption" style={styles.durationLabel}>12h</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
});

SleepDurationGoal.displayName = 'SleepDurationGoal';

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  durationContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  durationText: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: '700',
  },
  durationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  durationLabel: {
    opacity: 0.6,
  },
});

export default SleepDurationGoal;