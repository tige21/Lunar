import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  SlideInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { 
  ThemedView, 
  TitleText, 
  BodyText, 
  LabelText,
  ThemedButton,
  TimePicker,
  RangeSlider,
  SafeContainer,
} from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, DesignTokens } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SleepGoals {
  sleepDuration: number; // hours
  bedtime: Date;
  wakeTime: Date;
  age?: number;
}

interface SleepGoalsScreenProps {
  onNext?: (goals: SleepGoals) => void;
  initialGoals?: Partial<SleepGoals>;
}

// Age-based sleep recommendations (hours)
const SLEEP_RECOMMENDATIONS = {
  '18-25': { min: 7, max: 9, optimal: 8 },
  '26-64': { min: 7, max: 9, optimal: 8 },
  '65+': { min: 7, max: 8, optimal: 7.5 },
};

export default function SleepGoalsScreen({ onNext, initialGoals }: SleepGoalsScreenProps) {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // State management
  const [sleepDuration, setSleepDuration] = useState(initialGoals?.sleepDuration || 8);
  const [bedtime, setBedtime] = useState(initialGoals?.bedtime || new Date(2024, 0, 1, 22, 30)); // 10:30 PM
  const [wakeTime, setWakeTime] = useState(initialGoals?.wakeTime || new Date(2024, 0, 1, 6, 30)); // 6:30 AM
  const [ageGroup, setAgeGroup] = useState<keyof typeof SLEEP_RECOMMENDATIONS>('26-64');
  const [showValidation, setShowValidation] = useState(false);

  // Animation values
  const progressScale = useSharedValue(0);
  const goalCardScale = useSharedValue(0);
  const timePickerScale = useSharedValue(0);
  const validationOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    progressScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    goalCardScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    timePickerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  // Calculate actual sleep duration from bed/wake times
  const calculateActualSleepTime = (): number => {
    let sleepStart = bedtime.getTime();
    let sleepEnd = wakeTime.getTime();
    
    // Handle cross-midnight sleep
    if (sleepEnd < sleepStart) {
      sleepEnd += 24 * 60 * 60 * 1000; // Add 24 hours
    }
    
    const diffMs = sleepEnd - sleepStart;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10; // Round to 1 decimal
  };

  const actualSleepTime = calculateActualSleepTime();

  // Validation logic
  const validateGoals = (): { valid: boolean; message: string } => {
    const recommendations = SLEEP_RECOMMENDATIONS[ageGroup];
    
    if (actualSleepTime < 5) {
      return { valid: false, message: 'Sleep duration is too short for good health' };
    }
    
    if (actualSleepTime > 12) {
      return { valid: false, message: 'Sleep duration is unusually long' };
    }
    
    if (actualSleepTime < recommendations.min) {
      return { 
        valid: false, 
        message: `For your age group, aim for at least ${recommendations.min} hours of sleep` 
      };
    }
    
    return { valid: true, message: 'Your sleep goals look great!' };
  };

  const validation = validateGoals();

  // Handle bedtime change and auto-adjust wake time
  const handleBedtimeChange = (newBedtime: Date) => {
    setBedtime(newBedtime);
    
    // Auto-calculate wake time based on desired sleep duration
    const wakeTimeMs = newBedtime.getTime() + (sleepDuration * 60 * 60 * 1000);
    const newWakeTime = new Date(wakeTimeMs);
    
    // Handle day overflow
    if (newWakeTime.getDate() !== newBedtime.getDate()) {
      setWakeTime(new Date(2024, 0, 1, newWakeTime.getHours(), newWakeTime.getMinutes()));
    } else {
      setWakeTime(newWakeTime);
    }
    
    Haptics.selectionAsync();
  };

  // Handle wake time change and auto-adjust bedtime
  const handleWakeTimeChange = (newWakeTime: Date) => {
    setWakeTime(newWakeTime);
    
    // Auto-calculate bedtime based on desired sleep duration
    const bedtimeMs = newWakeTime.getTime() - (sleepDuration * 60 * 60 * 1000);
    const newBedtime = new Date(bedtimeMs);
    
    // Handle day underflow
    if (newBedtime.getDate() !== newWakeTime.getDate()) {
      setBedtime(new Date(2024, 0, 1, newBedtime.getHours(), newBedtime.getMinutes()));
    } else {
      setBedtime(newBedtime);
    }
    
    Haptics.selectionAsync();
  };

  // Handle sleep duration change and adjust wake time
  const handleSleepDurationChange = (newDuration: number) => {
    setSleepDuration(newDuration);
    
    // Adjust wake time to maintain bedtime
    const wakeTimeMs = bedtime.getTime() + (newDuration * 60 * 60 * 1000);
    const newWakeTime = new Date(wakeTimeMs);
    setWakeTime(new Date(2024, 0, 1, newWakeTime.getHours(), newWakeTime.getMinutes()));
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    if (!validation.valid) {
      Alert.alert('Sleep Goals Review', validation.message + '\n\nWould you like to continue anyway?', [
        { text: 'Adjust Goals', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext?.({ sleepDuration, bedtime, wakeTime });
          }
        }
      ]);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNext?.({ sleepDuration, bedtime, wakeTime });
  };

  // Animated styles
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  const goalCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: goalCardScale.value }],
    opacity: goalCardScale.value,
  }));

  const timePickerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timePickerScale.value }],
    opacity: timePickerScale.value,
  }));

  const validationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: validationOpacity.value,
  }));

  // Show validation animation
  useEffect(() => {
    validationOpacity.value = withTiming(validation.valid ? 1 : 0.7, { duration: 300 });
  }, [validation.valid]);

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Get recommendation text
  const getRecommendationText = (): string => {
    const rec = SLEEP_RECOMMENDATIONS[ageGroup];
    return `Recommended: ${rec.min}-${rec.max} hours (optimal: ${rec.optimal} hours)`;
  };

  // Sleep quality indicator color
  const getQualityColor = (): string => {
    if (actualSleepTime < 6 || actualSleepTime > 10) return Colors.semantic.error;
    if (actualSleepTime < 7 || actualSleepTime > 9) return Colors.semantic.warning;
    return Colors.semantic.success;
  };

  return (
    <SafeContainer style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View entering={SlideInDown.delay(100)} style={progressAnimatedStyle}>
          <ThemedView style={styles.headerSection}>
            <TitleText style={styles.title}>
              Set Your Sleep Goals
            </TitleText>
            <BodyText style={styles.description}>
              Let's create a personalized sleep schedule that works for your lifestyle and promotes optimal rest.
            </BodyText>
          </ThemedView>
        </Animated.View>

        {/* Age Group Selection */}
        <Animated.View entering={FadeIn.delay(200)} style={goalCardAnimatedStyle}>
          <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <LabelText style={styles.sectionTitle}>Age Group</LabelText>
            <ThemedView style={styles.ageGroupContainer}>
              {Object.keys(SLEEP_RECOMMENDATIONS).map((age) => (
                <ThemedButton
                  key={age}
                  title={age === '65+' ? '65+' : age}
                  variant={ageGroup === age ? 'primary' : 'outline'}
                  size="small"
                  style={styles.ageButton}
                  onPress={() => setAgeGroup(age as keyof typeof SLEEP_RECOMMENDATIONS)}
                />
              ))}
            </ThemedView>
            <BodyText style={styles.recommendationText}>
              {getRecommendationText()}
            </BodyText>
          </ThemedView>
        </Animated.View>

        {/* Sleep Duration Goal */}
        <Animated.View entering={FadeIn.delay(300)} style={goalCardAnimatedStyle}>
          <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <LabelText style={styles.sectionTitle}>Target Sleep Duration</LabelText>
            <RangeSlider
              min={5}
              max={12}
              value={sleepDuration}
              onChange={handleSleepDurationChange}
              step={0.5}
              unit=" hrs"
              showValue={true}
              minimumTrackTintColor={tintColor}
            />
          </ThemedView>
        </Animated.View>

        {/* Time Goals Section */}
        <Animated.View entering={FadeIn.delay(400)} style={timePickerAnimatedStyle}>
          <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <LabelText style={styles.sectionTitle}>Sleep Schedule</LabelText>
            
            <ThemedView style={styles.timePickersContainer}>
              <ThemedView style={styles.timePickerRow}>
                <TimePicker
                  label="Bedtime"
                  value={bedtime}
                  onChange={handleBedtimeChange}
                  mode="12h"
                />
              </ThemedView>
              
              <ThemedView style={styles.timePickerRow}>
                <TimePicker
                  label="Wake Time"
                  value={wakeTime}
                  onChange={handleWakeTimeChange}
                  mode="12h"
                />
              </ThemedView>
            </ThemedView>

            {/* Sleep Duration Display */}
            <ThemedView style={[styles.durationDisplay, { borderColor: getQualityColor() }]}>
              <LabelText style={styles.durationLabel}>
                Actual Sleep Time
              </LabelText>
              <TitleText style={[styles.durationValue, { color: getQualityColor() }]}>
                {actualSleepTime} hours
              </TitleText>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Sleep Schedule Preview */}
        <Animated.View entering={FadeIn.delay(500)} style={goalCardAnimatedStyle}>
          <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <LabelText style={styles.sectionTitle}>Your Sleep Schedule</LabelText>
            
            <ThemedView style={styles.schedulePreview}>
              <ThemedView style={styles.scheduleItem}>
                <BodyText style={styles.scheduleLabel}>🛏️ Bedtime</BodyText>
                <BodyText style={styles.scheduleTime}>{formatTime(bedtime)}</BodyText>
              </ThemedView>
              
              <ThemedView style={[styles.sleepBar, { backgroundColor: Colors.sleepStages.deep }]} />
              
              <ThemedView style={styles.scheduleItem}>
                <BodyText style={styles.scheduleLabel}>☀️ Wake Time</BodyText>
                <BodyText style={styles.scheduleTime}>{formatTime(wakeTime)}</BodyText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Animated.View>

        {/* Validation Feedback */}
        <Animated.View style={validationAnimatedStyle}>
          <ThemedView 
            style={[
              styles.validationCard, 
              { 
                backgroundColor: validation.valid ? Colors.semantic.successLight : Colors.semantic.warningLight,
                borderColor: validation.valid ? Colors.semantic.success : Colors.semantic.warning,
              }
            ]}
          >
            <BodyText 
              style={[
                styles.validationText,
                { color: validation.valid ? Colors.semantic.success : Colors.semantic.warning }
              ]}
            >
              {validation.valid ? '✅ ' : '⚠️ '}{validation.message}
            </BodyText>
          </ThemedView>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View entering={FadeIn.delay(600)} style={styles.buttonContainer}>
          <ThemedButton
            title="Continue"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleContinue}
          />
        </Animated.View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.xl,
  },
  title: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: '90%',
    lineHeight: 24,
  },
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
  ageGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DesignTokens.spacing.md,
  },
  ageButton: {
    minWidth: 80,
  },
  recommendationText: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
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
  validationCard: {
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.lg,
    borderWidth: 1,
  },
  validationText: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: DesignTokens.fontSize.base,
  },
  buttonContainer: {
    marginTop: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
  },
});