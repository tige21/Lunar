import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText, TimePicker } from '@/components/ui';

interface SleepScheduleGoalProps {
  bedtime: string;
  wakeTime: string;
  onBedtimeChange: (time: string) => void;
  onWakeTimeChange: (time: string) => void;
}

const SleepScheduleGoal = memo(({ 
  bedtime, 
  wakeTime, 
  onBedtimeChange, 
  onWakeTimeChange 
}: SleepScheduleGoalProps) => {
  
  const stringToTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(2024, 0, 1, hours, minutes);
  };

  const timeToString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleBedtimeChange = (date: Date) => {
    onBedtimeChange(timeToString(date));
  };

  const handleWakeTimeChange = (date: Date) => {
    onWakeTimeChange(timeToString(date));
  };

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Preferred Sleep Schedule
      </ThemedText>
      <ThemedText type="body" style={styles.sectionDescription}>
        When do you typically go to bed and wake up?
      </ThemedText>
      
      <ThemedView style={styles.timePickersContainer}>
        <ThemedView style={styles.timePickerGroup}>
          <ThemedText type="body" style={styles.timePickerLabel}>Bedtime</ThemedText>
          <TimePicker
            value={stringToTime(bedtime)}
            onChange={handleBedtimeChange}
          />
        </ThemedView>
        
        <ThemedView style={styles.timePickerGroup}>
          <ThemedText type="body" style={styles.timePickerLabel}>Wake Time</ThemedText>
          <TimePicker
            value={stringToTime(wakeTime)}
            onChange={handleWakeTimeChange}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
});

SleepScheduleGoal.displayName = 'SleepScheduleGoal';

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
  timePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  timePickerGroup: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    marginBottom: 12,
    fontSize: 16,
  },
});

export default SleepScheduleGoal;