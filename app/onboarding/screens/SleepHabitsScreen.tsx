import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ThemedView, 
  ThemedText, 
  ThemedButton, 
  TitleText,
  BodyText,
  CaptionText 
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RangeSlider, TimePicker, ToggleButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';

interface SleepHabitsScreenProps {
  onNext?: () => void;
}

export default function SleepHabitsScreen({ onNext }: SleepHabitsScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const [weekdayBedtime, setWeekdayBedtime] = useState('23:00');
  const [weekendBedtime, setWeekendBedtime] = useState('00:00');
  const [napFrequency, setNapFrequency] = useState<'never' | 'rarely' | 'sometimes' | 'often' | 'daily'>('rarely');
  const [weekendSleepIn, setWeekendSleepIn] = useState(false);
  const [fallAsleepTime, setFallAsleepTime] = useState(15);
  const [nightWakings, setNightWakings] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const napOptions: Array<{ value: typeof napFrequency, label: string }> = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'daily', label: 'Daily' },
  ];

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      await onboardingService.updateExtendedDataSection('sleepHabits', {
        weekdayBedtime,
        weekendBedtime,
        napFrequency,
        weekendSleepIn,
        averageFallAsleepTime: fallAsleepTime,
        nightWakingsFrequency: nightWakings,
      });

      onNext?.();
    } catch (error) {
      console.error('Error saving sleep habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
            <IconSymbol name="moon.zzz.fill" size={32} color={tintColor} />
          </ThemedView>
          
          <TitleText style={styles.title}>
            Your Sleep Habits
          </TitleText>
          
          <BodyText style={styles.description}>
            Help us understand your current sleep patterns to provide better personalized advice.
          </BodyText>
        </ThemedView>

        {/* Sleep Schedule */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>Sleep Schedule</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Weekday bedtime</ThemedText>
            <TimePicker
              value={weekdayBedtime}
              onChange={setWeekdayBedtime}
              style={styles.timePicker}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Weekend bedtime</ThemedText>
            <TimePicker
              value={weekendBedtime}
              onChange={setWeekendBedtime}
              style={styles.timePicker}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Do you sleep in on weekends?</ThemedText>
            <ToggleButton
              value={weekendSleepIn}
              onChange={setWeekendSleepIn}
              trueLabel="Yes"
              falseLabel="No"
            />
          </ThemedView>
        </ThemedView>

        {/* Sleep Quality */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>Sleep Quality</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              How long does it usually take you to fall asleep?
            </ThemedText>
            <CaptionText style={styles.valueText}>{fallAsleepTime} minutes</CaptionText>
            <RangeSlider
              value={fallAsleepTime}
              onValueChange={setFallAsleepTime}
              minimumValue={5}
              maximumValue={60}
              step={5}
              style={styles.slider}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              How often do you wake up during the night? (per week)
            </ThemedText>
            <CaptionText style={styles.valueText}>{nightWakings} times</CaptionText>
            <RangeSlider
              value={nightWakings}
              onValueChange={setNightWakings}
              minimumValue={0}
              maximumValue={14}
              step={1}
              style={styles.slider}
            />
          </ThemedView>
        </ThemedView>

        {/* Napping */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>Napping Habits</ThemedText>
          <ThemedText style={styles.inputLabel}>How often do you take naps?</ThemedText>
          
          <ThemedView style={styles.optionsGrid}>
            {napOptions.map((option) => (
              <ToggleButton
                key={option.value}
                value={napFrequency === option.value}
                onChange={(selected) => selected && setNapFrequency(option.value)}
                trueLabel={option.label}
                falseLabel={option.label}
                style={styles.optionButton}
                variant={napFrequency === option.value ? 'primary' : 'outline'}
              />
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.spacer} />
      </ScrollView>

      {/* Action Button */}
      <ThemedView style={styles.actions}>
        <ThemedButton
          title={isLoading ? 'Saving...' : 'Continue'}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          onPress={handleNext}
          disabled={isLoading}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: '90%',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  timePicker: {
    alignSelf: 'center',
  },
  slider: {
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    minWidth: '30%',
    flex: 1,
  },
  spacer: {
    height: 40,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
});