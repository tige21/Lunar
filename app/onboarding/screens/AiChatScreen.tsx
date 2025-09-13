import {
  CaptionText,
  SafeContainer,
  ThemedButton,
  ThemedView,
  TitleText
} from '@/components/ui';
import AiChatHeader from '@/components/ui/AiChatScreen/AiChatHeader';
import ChatDemo from '@/components/ui/AiChatScreen/ChatDemo';
import FeatureCard from '@/components/ui/AiChatScreen/FeatureCard';
import LunaAvatar from '@/components/ui/AiChatScreen/LunaAvatar';
import TrustCard from '@/components/ui/AiChatScreen/TrustCard';
import { TRANSLATIONS } from '@/components/ui/AiChatScreen/messages';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { languageDetector } from '@/lib/languageDetection';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AiChatScreenProps {
  onNext?: () => void;
}

export default function AiChatScreen({ onNext }: AiChatScreenProps) {
  const colorScheme = useColorScheme();
  const backgroundColorRaw = useThemeColor({}, 'background');
  const backgroundColor = typeof backgroundColorRaw === 'string' ? backgroundColorRaw : '#F8FAFC';
  
  // Detect system language
  const deviceLanguage = useMemo(() => {
    const detectedLang = languageDetector.getDeviceLanguage();
    return detectedLang === 'ru' ? 'ru' : 'en';
  }, []);
  
  const t = useMemo(() => TRANSLATIONS[deviceLanguage], [deviceLanguage]);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const lunaScale = useSharedValue(0);
  const chatOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const trustOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Initial entrance animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    lunaScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back()) }),
      withTiming(1, { duration: 300 })
    );
    chatOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    featuresOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    trustOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(1600, withTiming(0, { duration: 500 }));
    
    // Start glow effect
    glowOpacity.value = withDelay(1000, 
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      )
    );
    
  }, [lunaScale, headerOpacity, glowOpacity, chatOpacity, featuresOpacity, trustOpacity, buttonTranslateY]);
  
  const handleTryLuna = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNext?.();
  }, [onNext]);
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));
  
  const lunaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lunaScale.value }],
  }));
  
  const chatAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chatOpacity.value,
  }));
  
  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));
  
  const trustAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trustOpacity.value,
  }));
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trustOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <SafeContainer>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <Animated.View style={[styles.headerSection, headerAnimatedStyle]}>
            {/* Glow effect */}
            <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
            
            <Animated.View style={lunaAnimatedStyle}>
              <LunaAvatar colorScheme={colorScheme} />
            </Animated.View>
            
            <AiChatHeader language={deviceLanguage} />
          </Animated.View>
          
          {/* Chat Demo Section */}
          <Animated.View style={chatAnimatedStyle}>
            <ChatDemo language={deviceLanguage} />
          </Animated.View>
          
          {/* Features Section */}
          <Animated.View style={[styles.featuresSection, featuresAnimatedStyle]}>
            <TitleText style={styles.featuresTitle}>
              {t.whatLunaCanDo}
            </TitleText>
            
            <ThemedView style={styles.featuresGrid}>
              <FeatureCard
                icon="chart.line.uptrend.xyaxis"
                iconColor={Colors.sleepStages.rem}
                title={t.sleepAnalysis}
                description={t.sleepAnalysisDesc}
                colorScheme={colorScheme}
              />
              
              <FeatureCard
                icon="lightbulb.fill"
                iconColor={Colors.semantic.info}
                title={t.smartSuggestions}
                description={t.smartSuggestionsDesc}
                colorScheme={colorScheme}
              />
              
              <FeatureCard
                icon="target"
                iconColor={Colors.sleepStages.wake}
                title={t.goalTracking}
                description={t.goalTrackingDesc}
                colorScheme={colorScheme}
              />
              
              <FeatureCard
                icon="bubble.left.and.bubble.right.fill"
                iconColor={Colors.semantic.success}
                title={t.support247}
                description={t.support247Desc}
                colorScheme={colorScheme}
              />
            </ThemedView>
          </Animated.View>
          
          {/* Trust & Privacy Section */}
          <Animated.View style={[styles.trustSection, trustAnimatedStyle]}>
            <TrustCard language={deviceLanguage} colorScheme={colorScheme} />
          </Animated.View>
        </ScrollView>
        
        {/* Action Button */}
        <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
          <ThemedButton 
            title={t.continueToLuna}
            variant="primary" 
            size="large" 
            fullWidth
            onPress={handleTryLuna}
          />
          
          <CaptionText style={styles.actionNote}>
            {t.actionNote}
          </CaptionText>
        </Animated.View>
      </ThemedView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    top: 30,
    left: '50%',
    marginLeft: -50,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  trustSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  actionNote: {
    textAlign: 'center',
    opacity: 0.6,
  },
});