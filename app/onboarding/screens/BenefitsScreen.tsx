import BenefitGrid from '@/components/ui/BenefitsScreen/BenefitGrid';
import BenefitsAction from '@/components/ui/BenefitsScreen/BenefitsAction';
import BenefitsHeader from '@/components/ui/BenefitsScreen/BenefitsHeader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';


interface BenefitsScreenProps {
  onNext?: () => void;
}

export default function BenefitsScreen({ onNext }: BenefitsScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');

  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    buttonTranslateY.value = withDelay(1000, withTiming(0, { duration: 500 }));
  }, [headerOpacity, contentOpacity, buttonTranslateY]);

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <BenefitsHeader
        language={deviceLanguage}
        headerOpacity={headerOpacity}
      />

      {/* Benefits Grid */}
      {/* <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      > */}
        <BenefitGrid
          language={deviceLanguage}
          contentOpacity={contentOpacity}
        />

        {/* Trust Indicators */}
       
      {/* </ScrollView> */}

      {/* Continue Button */}
      <BenefitsAction
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    
  },
});