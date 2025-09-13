import React, { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ThemedButton, CaptionText } from '@/components/ui';
import { CompletionActionProps } from './types';
import { TRANSLATIONS } from './messages';

export default function CompletionAction({
  language,
  onComplete,
  buttonOpacity,
  buttonTranslateY
}: CompletionActionProps) {
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const handleStartTracking = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    onComplete?.();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
      <ThemedButton
        title={t.startButton}
        variant="primary"
        size="xl"
        fullWidth
        onPress={handleStartTracking}
      />

      <CaptionText style={styles.encouragement}>
        {t.encouragement}
      </CaptionText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    gap: 16,
  },
  encouragement: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});