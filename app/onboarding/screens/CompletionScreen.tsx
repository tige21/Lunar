import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
    Easing,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import CompletionSuccess from '@/components/ui/CompletionScreen/CompletionSuccess';
import CompletionAction from '@/components/ui/CompletionScreen/CompletionAction';


interface CompletionScreenProps {
  onComplete?: () => void;
}

export default function CompletionScreen({ onComplete }: CompletionScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');

  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  // Animation values
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);

  useEffect(() => {
    // Celebration haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Success icon animation
    successScale.value = withSequence(
      withTiming(1.3, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 300 })
    );
    successOpacity.value = withTiming(1, { duration: 600 });
    
    // Content animations
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    buttonTranslateY.value = withDelay(1000, withTiming(0, { duration: 500 }));
  }, [successScale, successOpacity, titleOpacity, contentOpacity, buttonTranslateY]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Success Animation */}
      <CompletionSuccess
        language={deviceLanguage}
        successScale={successScale}
        successOpacity={successOpacity}
        titleOpacity={titleOpacity}
        contentOpacity={contentOpacity}
      />

      {/* Call to Action */}
      <CompletionAction
        language={deviceLanguage}
        onComplete={onComplete}
        buttonOpacity={contentOpacity}
        buttonTranslateY={buttonTranslateY}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});