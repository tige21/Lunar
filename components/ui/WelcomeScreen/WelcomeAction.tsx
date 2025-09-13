import React, { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedButton, CaptionText } from '@/components/ui';
import { WelcomeActionProps } from './types';
import { TRANSLATIONS } from './messages';

export default function WelcomeAction({
  language,
  onNext,
  buttonOpacity,
  buttonTranslateY
}: WelcomeActionProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const handleGetStarted = () => {
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
        title={t.getStarted}
        variant="sleep"
        size="large"
        fullWidth
        onPress={handleGetStarted}
      />

      <CaptionText style={styles.setupTime}>
        {t.setupTime}
      </CaptionText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 24,
    gap: 16,
  },
  setupTime: {
    textAlign: 'center',
    opacity: 0.6,
  },
});