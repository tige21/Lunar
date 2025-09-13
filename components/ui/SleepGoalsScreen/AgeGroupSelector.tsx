import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BodyText, LabelText, ThemedButton, ThemedView } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import { TRANSLATIONS } from './messages';
import { AgeGroupSelectorProps, SLEEP_RECOMMENDATIONS } from './types';

export default function AgeGroupSelector({
  language,
  ageGroup,
  onAgeGroupChange,
  surfaceColor,
  borderColor,
  goalCardAnimatedStyle
}: AgeGroupSelectorProps) {
  const t = TRANSLATIONS[language];

  const getRecommendationText = (age: keyof typeof SLEEP_RECOMMENDATIONS): string => {
    const rec = SLEEP_RECOMMENDATIONS[age];
    return t.ageRecommendation[age];
  };

  return (
    <Animated.View entering={FadeIn.delay(200)} style={goalCardAnimatedStyle}>
      <ThemedView style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
        <LabelText style={styles.sectionTitle}>{t.ageGroup}</LabelText>
        <ThemedView style={styles.ageGroupContainer}>
          {Object.keys(SLEEP_RECOMMENDATIONS).map((age) => (
            <ThemedButton
              key={age}
              title={age === '65+' ? '65+' : age}
              variant={ageGroup === age ? 'primary' : 'outline'}
              size="small"
              style={styles.ageButton}
              onPress={() => onAgeGroupChange(age as keyof typeof SLEEP_RECOMMENDATIONS)}
            />
          ))}
        </ThemedView>
        <BodyText style={styles.recommendationText}>
          {getRecommendationText(ageGroup)}
        </BodyText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});