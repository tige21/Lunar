import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedText } from '@/components/ui';
import { BenefitsHeaderProps } from './types';
import { TRANSLATIONS } from './messages';

export default function BenefitsHeader({ language, headerOpacity }: BenefitsHeaderProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <ThemedText type="title" style={styles.title}>
        {t.title}
      </ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        {t.subtitle}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 16,
  },
});