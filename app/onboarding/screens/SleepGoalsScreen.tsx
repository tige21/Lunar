import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import {
  AgeGroupSelector,
  SLEEP_RECOMMENDATIONS,
  SleepDurationSlider,
  SleepGoalsAction,
  SleepGoalsHeader,
  SleepGoalsScreenProps,
  SleepSchedulePreview,
  TimeScheduleSelector,
  TRANSLATIONS,
  ValidationFeedback
} from '@/components/ui/SleepGoalsScreen';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';

export default function SleepGoalsScreen({ onNext, initialGoals }: SleepGoalsScreenProps) {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  const t = TRANSLATIONS[deviceLanguage];

  // State management
  const [sleepDuration, setSleepDuration] = useState(initialGoals?.sleepDuration || 8);
  const [bedtime, setBedtime] = useState(initialGoals?.bedtime || new Date(2024, 0, 1, 22, 30)); // 10:30 PM
  const [wakeTime, setWakeTime] = useState(initialGoals?.wakeTime || new Date(2024, 0, 1, 6, 30)); // 6:30 AM
  const [ageGroup, setAgeGroup] = useState<keyof typeof SLEEP_RECOMMENDATIONS>('26-64');

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
  }, [progressScale, goalCardScale, timePickerScale]);

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
      return { valid: false, message: t.validation.tooShort };
    }

    if (actualSleepTime > 12) {
      return { valid: false, message: t.validation.tooLong };
    }

    if (actualSleepTime < recommendations.min) {
      return {
        valid: false,
        message: t.validation.belowRecommended.replace('{min}', recommendations.min.toString())
      };
    }

    return { valid: true, message: t.validation.great };
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
      Alert.alert(t.alertTitle, validation.message + '\n\n' + t.alertMessage, [
        { text: t.alertButtons.adjustGoals, style: 'cancel' },
        {
          text: t.alertButtons.continue,
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
  }, [validation.valid, validationOpacity]);

  // Format time for display
  const formatTime = (date: Date): string => {
    const locale = deviceLanguage === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: deviceLanguage === 'en'
    });
  };

  // Sleep quality indicator color
  const getQualityColor = (): string => {
    if (actualSleepTime < 6 || actualSleepTime > 10) return Colors.semantic.error;
    if (actualSleepTime < 7 || actualSleepTime > 9) return Colors.semantic.warning;
    return Colors.semantic.success;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* <
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      > */}
        {/* Header Section */}
        <SleepGoalsHeader
          language={deviceLanguage}
          progressAnimatedStyle={progressAnimatedStyle}
        />

        {/* Age Group Selection */}
        <AgeGroupSelector
          language={deviceLanguage}
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
          surfaceColor={surfaceColor}
          borderColor={borderColor}
          goalCardAnimatedStyle={goalCardAnimatedStyle}
        />

        {/* Sleep Duration Goal */}
        <SleepDurationSlider
          language={deviceLanguage}
          sleepDuration={sleepDuration}
          onSleepDurationChange={handleSleepDurationChange}
          tintColor={tintColor}
          surfaceColor={surfaceColor}
          borderColor={borderColor}
          goalCardAnimatedStyle={goalCardAnimatedStyle}
        />

        {/* Time Goals Section */}
        <TimeScheduleSelector
          language={deviceLanguage}
          bedtime={bedtime}
          wakeTime={wakeTime}
          onBedtimeChange={handleBedtimeChange}
          onWakeTimeChange={handleWakeTimeChange}
          actualSleepTime={actualSleepTime}
          getQualityColor={getQualityColor}
          surfaceColor={surfaceColor}
          borderColor={borderColor}
          timePickerAnimatedStyle={timePickerAnimatedStyle}
        />

        {/* Sleep Schedule Preview */}
        <SleepSchedulePreview
          language={deviceLanguage}
          bedtime={bedtime}
          wakeTime={wakeTime}
          formatTime={formatTime}
          surfaceColor={surfaceColor}
          borderColor={borderColor}
          goalCardAnimatedStyle={goalCardAnimatedStyle}
        />

        {/* Validation Feedback */}
        <ValidationFeedback
          language={deviceLanguage}
          validation={validation}
          validationAnimatedStyle={validationAnimatedStyle}
        />

        {/* Continue Button */}
        <SleepGoalsAction
          language={deviceLanguage}
          onContinue={handleContinue}
        />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.xl,
  },
});