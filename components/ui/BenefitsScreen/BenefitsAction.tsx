import { ThemedButton } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { TRANSLATIONS } from './messages';
import { BenefitsActionProps } from './types';

export default function BenefitsAction({
  language,
  onNext,
  buttonOpacity,
  buttonTranslateY
}: BenefitsActionProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const handleContinue = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNext?.();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
      <ThemedButton
        title={t.continue}
        variant="sleep"
        size="large"
        fullWidth
        onPress={handleContinue}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    paddingBottom: 32,
    paddingTop: 16,
  },
});