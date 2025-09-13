import { BodyText, ThemedText, ThemedView, TitleText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { onboardingService } from '@/lib/database/onboardingService';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface SleepHabitsScreenProps {
  onNext?: () => void;
}

export default function SleepHabitsScreenSimple({ onNext }: SleepHabitsScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const [weekdayBedtime, setWeekdayBedtime] = useState('23:00');
  const [weekendBedtime, setWeekendBedtime] = useState('00:00');
  const [napFrequency, setNapFrequency] = useState<'never' | 'rarely' | 'sometimes' | 'often' | 'daily'>('rarely');
  const [weekendSleepIn, setWeekendSleepIn] = useState(false);
  const [fallAsleepTime, setFallAsleepTime] = useState('15');
  const [nightWakings, setNightWakings] = useState('2');
  const [isLoading, setIsLoading] = useState(false);

  const napOptions = [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'daily', label: 'Daily' },
  ] as const;

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      await onboardingService.updateExtendedDataSection('sleepHabits', {
        weekdayBedtime,
        weekendBedtime,
        napFrequency,
        weekendSleepIn,
        averageFallAsleepTime: parseInt(fallAsleepTime) || 15,
        nightWakingsFrequency: parseInt(nightWakings) || 2,
      });

      onNext?.();
    } catch (error) {
      console.error('Error saving sleep habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SimpleButton = ({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: selected ? tintColor : 'transparent',
          borderColor: tintColor,
          borderWidth: 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.optionText, { color: selected ? '#FFFFFF' : textColor }]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* <ScrollView style={styles.content} showsVerticalScrollIndicator={false}> */}
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
            <TextInput
              style={[styles.timeInput, { borderColor: tintColor + '30', color: textColor }]}
              value={weekdayBedtime}
              onChangeText={setWeekdayBedtime}
              placeholder="23:00"
              placeholderTextColor={textColor + '60'}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Weekend bedtime</ThemedText>
            <TextInput
              style={[styles.timeInput, { borderColor: tintColor + '30', color: textColor }]}
              value={weekendBedtime}
              onChangeText={setWeekendBedtime}
              placeholder="00:00"
              placeholderTextColor={textColor + '60'}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Do you sleep in on weekends?</ThemedText>
            <ThemedView style={styles.toggleRow}>
              <SimpleButton
                title="Yes"
                selected={weekendSleepIn}
                onPress={() => setWeekendSleepIn(true)}
              />
              <SimpleButton
                title="No"
                selected={!weekendSleepIn}
                onPress={() => setWeekendSleepIn(false)}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Sleep Quality */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>Sleep Quality</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              How long does it usually take you to fall asleep? (minutes)
            </ThemedText>
            <TextInput
              style={[styles.numberInput, { borderColor: tintColor + '30', color: textColor }]}
              value={fallAsleepTime}
              onChangeText={setFallAsleepTime}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={textColor + '60'}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              How often do you wake up during the night? (per week)
            </ThemedText>
            <TextInput
              style={[styles.numberInput, { borderColor: tintColor + '30', color: textColor }]}
              value={nightWakings}
              onChangeText={setNightWakings}
              keyboardType="numeric"
              placeholder="2"
              placeholderTextColor={textColor + '60'}
            />
          </ThemedView>
        </ThemedView>

        {/* Napping */}
        <ThemedView style={[styles.section, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.sectionTitle}>Napping Habits</ThemedText>
          <ThemedText style={styles.inputLabel}>How often do you take naps?</ThemedText>
          
          <ThemedView style={styles.optionsGrid}>
            {napOptions.map((option) => (
              <SimpleButton
                key={option.value}
                title={option.label}
                selected={napFrequency === option.value}
                onPress={() => setNapFrequency(option.value)}
              />
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.spacer} />
   

      {/* Action Button */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { 
              backgroundColor: isLoading ? tintColor + '60' : tintColor,
              opacity: isLoading ? 0.6 : 1,
            }
          ]}
          onPress={handleNext}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,

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
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    width: 80,
    alignSelf: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});