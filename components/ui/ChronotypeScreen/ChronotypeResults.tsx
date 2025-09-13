import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { ThemedView, ThemedText, ThemedButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChronotypeResult } from './types';
import { getResultTitle, getResultEmoji } from './utils';
import { messages } from './messages';

interface ChronotypeResultsProps {
  result: ChronotypeResult;
  resultScale: SharedValue<number>;
  onNext: () => void;
  language?: 'en' | 'ru';
}

export default function ChronotypeResults({
  result,
  resultScale,
  onNext,
  language = 'en'
}: ChronotypeResultsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  const resultAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: resultScale.value }],
      opacity: resultScale.value,
    };
  });

  const msgs = messages[language];
  const resultTitle = getResultTitle(result.type, language);
  const resultEmoji = getResultEmoji(result.type);

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.resultsContainer, resultAnimatedStyle]}>
        <ThemedView style={styles.resultHeader}>
          <ThemedText style={styles.resultEmoji}>
            {resultEmoji}
          </ThemedText>
          <ThemedText type="title" style={styles.resultTitle}>
            {resultTitle}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.resultCard, { backgroundColor: surfaceColor }]}>
          <ThemedText type="body" style={styles.resultDescription}>
            {result.description}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.recommendationsContainer}>
          <ThemedText type="subtitle" style={styles.recommendationsTitle}>
            {msgs.results.recommendationsTitle}
          </ThemedText>
          {result.recommendations.map((rec, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 100)}
              style={[styles.recommendationItem, { backgroundColor: surfaceColor }]}
            >
              <ThemedText style={styles.recommendationBullet}>•</ThemedText>
              <ThemedText type="caption" style={styles.recommendationText}>
                {rec}
              </ThemedText>
            </Animated.View>
          ))}
        </ThemedView>

        <ThemedButton
          title={msgs.results.continueButton}
          variant="primary"
          size="large"
          fullWidth
          onPress={onNext}
          style={styles.nextButton}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  resultDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 32,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recommendationBullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  nextButton: {
    marginTop: 16,
  },
});