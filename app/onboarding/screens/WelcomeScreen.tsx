import WelcomeAction from '@/components/ui/WelcomeScreen/WelcomeAction';
import WelcomeFeatures from '@/components/ui/WelcomeScreen/WelcomeFeatures';
import WelcomeHero from '@/components/ui/WelcomeScreen/WelcomeHero';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Easing,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';


interface WelcomeScreenProps {
  onNext?: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  // Animation values
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const waveOpacity = useSharedValue(0);
  const featureOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    // Entrance animations
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 200 })
    );
    
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    waveOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    featureOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(1200, withTiming(0, { duration: 500 }));
    
    // Continuous pulse animation for logo
    const startPulse = () => {
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      );
    };
    
    const timeout = setTimeout(() => {
      const interval = setInterval(startPulse, 4000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [logoScale, pulseScale, titleOpacity, contentOpacity, waveOpacity, featureOpacity, buttonTranslateY]);

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Hero Section */}
      <WelcomeHero
        language={deviceLanguage}
        primaryColor={primaryColor}
        pulseScale={pulseScale}
        logoScale={logoScale}
        titleOpacity={titleOpacity}
        contentOpacity={contentOpacity}
      />

      {/* Visual Elements */}


      {/* Key Features Preview */}
      <WelcomeFeatures
        language={deviceLanguage}
        primaryColor={primaryColor}
        featureOpacity={featureOpacity}
      />

      {/* Call to Action */}
      <WelcomeAction
        language={deviceLanguage}
        onNext={onNext}
        buttonOpacity={contentOpacity}
        buttonTranslateY={buttonTranslateY}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});