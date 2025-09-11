import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemedView, ThemedText, ThemedButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ChronotypeQuestionData {
  id: string;
  question: string;
  icon: string;
  options: {
    id: string;
    label: string;
    value: number;
    description?: string;
  }[];
}

interface ChronotypeQuestionProps {
  question: ChronotypeQuestionData;
  currentIndex: number;
  totalQuestions: number;
  onAnswerSelect: (optionId: string, value: number) => void;
  animatedStyle?: any;
}

const ChronotypeQuestion = memo(({
  question,
  currentIndex,
  totalQuestions,
  onAnswerSelect,
  animatedStyle,
}: ChronotypeQuestionProps) => {
  const primaryColor = useThemeColor({}, 'tint');

  return (
    <Animated.View style={animatedStyle}>
      <ThemedView style={styles.questionHeader}>
        <ThemedText style={styles.questionIcon}>
          {question.icon}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.questionCounter}>
          Question {currentIndex + 1} of {totalQuestions}
        </ThemedText>
      </ThemedView>

      <ThemedText type="defaultSemiBold" style={styles.questionText}>
        {question.question}
      </ThemedText>

      <ThemedView style={styles.optionsContainer}>
        {question.options.map((option) => (
          <ThemedButton
            key={option.id}
            variant="outline"
            style={[
              styles.optionButton,
              { borderColor: primaryColor + '30' }
            ]}
            onPress={() => onAnswerSelect(option.id, option.value)}
          >
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold" style={styles.optionLabel}>
                {option.label}
              </ThemedText>
              {option.description && (
                <ThemedText type="caption" style={styles.optionDescription}>
                  {option.description}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedButton>
        ))}
      </ThemedView>
    </Animated.View>
  );
});

ChronotypeQuestion.displayName = 'ChronotypeQuestion';

const styles = StyleSheet.create({
  questionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  questionCounter: {
    fontSize: 14,
    opacity: 0.7,
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionContent: {
    alignItems: 'center',
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
  },
  optionDescription: {
    opacity: 0.7,
    fontSize: 12,
  },
});

export default ChronotypeQuestion;