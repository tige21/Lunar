import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedView, LabelText } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { WelcomeFeaturesProps } from './types';
import { TRANSLATIONS } from './messages';

export default function WelcomeFeatures({
  language,
  primaryColor,
  featureOpacity
}: WelcomeFeaturesProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const featureAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featureOpacity.value,
  }));

  return (
    <Animated.View style={[styles.featuresPreview, featureAnimatedStyle]}>
      <ThemedView style={styles.featureRow}>
        <ThemedView style={[styles.featureDot, { backgroundColor: Colors.semantic.success }]} />
        <LabelText style={styles.featureText}>
          {t.feature1}
        </LabelText>
      </ThemedView>

      <ThemedView style={styles.featureRow}>
        <ThemedView style={[styles.featureDot, { backgroundColor: primaryColor }]} />
        <LabelText style={styles.featureText}>
          {t.feature2}
        </LabelText>
      </ThemedView>

      <ThemedView style={styles.featureRow}>
        <ThemedView style={[styles.featureDot, { backgroundColor: Colors.sleepStages.wake }]} />
        <LabelText style={styles.featureText}>
          {t.feature3}
        </LabelText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  featuresPreview: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    opacity: 0.8,
    flex: 1,
  },
});