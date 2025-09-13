import React from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedView, ThemedText } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Question } from './types';

interface ChronotypeQuestionProps {
  question: Question;
  questionIndex: number;
  selectedOption: number | null;
  onOptionSelect: (optionIndex: number, value: number) => Promise<void>;
}

export default function ChronotypeQuestion({
  question,
  questionIndex,
  selectedOption,
  onOptionSelect
}: ChronotypeQuestionProps) {
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const handleOptionPress = async (optionIndex: number, value: number) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await onOptionSelect(optionIndex, value);
  };

  return (
    <>
      {/* Question */}
      <Animated.View
        key={questionIndex}
        entering={SlideInRight.delay(100)}
        exiting={SlideOutLeft}
        style={styles.questionContainer}
      >
        <ThemedText type="title" style={styles.questionText}>
          {question.question}
        </ThemedText>
      </Animated.View>

      {/* Options */}
      <ThemedView style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(200 + index * 50)}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: surfaceColor },
                selectedOption === index && { backgroundColor: primaryColor },
              ]}
              onPress={() => handleOptionPress(index, option.value)}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.optionEmoji}>
                {option.emoji}
              </ThemedText>
              <ThemedText
                type="body"
                style={[
                  styles.optionText,
                  { color: selectedOption === index ? '#FFFFFF' : textColor },
                ]}
              >
                {option.text}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});