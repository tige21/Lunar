import React, { memo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemedView, ThemedText, ThemedButton } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ChronotypeResults {
  score: number;
  type: 'extreme_morning' | 'morning' | 'neutral' | 'evening' | 'extreme_evening';
  label: string;
  description: string;
  recommendations: string[];
  responses: Record<string, number>;
}

interface ChronotypeResultsProps {
  results: ChronotypeResults;
  onContinue: () => void;
  isLoading?: boolean;
  animatedStyle?: any;
}

const ChronotypeResults = memo(({
  results,
  onContinue,
  isLoading = false,
  animatedStyle,
}: ChronotypeResultsProps) => {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'backgroundSolid');

  const getChronotypeIcon = () => {
    switch (results.type) {
      case 'extreme_morning':
        return '🌅';
      case 'morning':
        return '☀️';
      case 'neutral':
        return '⚖️';
      case 'evening':
        return '🌙';
      case 'extreme_evening':
        return '🦉';
      default:
        return '⚖️';
    }
  };

  const getScoreColor = () => {
    if (results.score >= 16) return '#10B981'; // Green
    if (results.score >= 12) return '#F59E0B'; // Orange
    if (results.score >= 8) return '#3B82F6'; // Blue
    if (results.score >= 4) return '#8B5CF6'; // Purple
    return '#EF4444'; // Red
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.resultsContainer, animatedStyle]}>
        <ThemedView style={styles.resultHeader}>
          <ThemedText style={styles.resultIcon}>
            {getChronotypeIcon()}
          </ThemedText>
          <ThemedText type="title" style={styles.resultTitle}>
            {results.label}
          </ThemedText>
          <ThemedText type="body" style={styles.resultDescription}>
            {results.description}
          </ThemedText>
          <ThemedText type="caption" style={[styles.score, { color: getScoreColor() }]}>
            Chronotype Score: {results.score}/20
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.recommendationsSection}>
          <ThemedText type="defaultSemiBold" style={styles.recommendationsTitle}>
            Personalized Recommendations
          </ThemedText>
          <ThemedView style={styles.recommendationsList}>
            {results.recommendations.map((recommendation, index) => (
              <ThemedView key={index} style={styles.recommendationItem}>
                <ThemedText style={[styles.recommendationBullet, { color: primaryColor }]}>
                  •
                </ThemedText>
                <ThemedText type="body" style={styles.recommendationText}>
                  {recommendation}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.insightSection}>
          <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
            Sleep Science Insight
          </ThemedText>
          <ThemedText type="body" style={styles.insightText}>
            Your chronotype is largely determined by genetics and affects when your body naturally 
            wants to sleep and wake. Understanding your type helps optimize your sleep schedule 
            and daily productivity patterns.
          </ThemedText>
        </ThemedView>
      </Animated.View>

      <ThemedView style={styles.actionSection}>
        <ThemedButton 
          variant="sleep-action" 
          size="lg" 
          fullWidth
          onPress={onContinue}
          isLoading={isLoading}
        >
          Continue Setup
        </ThemedButton>
        <ThemedText type="caption" style={styles.actionHint}>
          We'll use this to personalize your sleep recommendations
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
});

ChronotypeResults.displayName = 'ChronotypeResults';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  insightSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  actionHint: {
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default ChronotypeResults;