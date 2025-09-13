import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { ThemedView, ThemedText } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatProgressText } from './utils';

interface ChronotypeHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  questionProgress: SharedValue<number>;
  language?: 'en' | 'ru';
}

export default function ChronotypeHeader({
  currentQuestion,
  totalQuestions,
  questionProgress,
  language = 'en'
}: ChronotypeHeaderProps) {
  const primaryColor = useThemeColor({}, 'tint');

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${questionProgress.value * 100}%`,
    };
  });

  return (
    <ThemedView style={styles.progressContainer}>
      <ThemedView style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: primaryColor },
            progressStyle,
          ]}
        />
      </ThemedView>
      <ThemedText type="caption" style={styles.progressText}>
        {formatProgressText(currentQuestion + 1, totalQuestions, language)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginTop: 0,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});