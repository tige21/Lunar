import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  SafeContainer, 
  ThemedView, 
 
  ThemedButton, 
  HeroText, 
  TitleText, 
  BodyText, 
  CaptionText,
  ChatBubble,
  TypingIndicator,
  type ChatMessage 
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface AiChatScreenProps {
  onNext?: () => void;
}

// Sample conversation showcasing Luna's capabilities
const DEMO_MESSAGES: Omit<ChatMessage, 'id' | 'timestamp'>[] = [
  {
    text: "Hi Luna! I've been having trouble falling asleep lately. Can you help?",
    isUser: true,
    type: 'text'
  },
  {
    text: "Hello! I'd love to help you improve your sleep. Based on your recent patterns, I notice you've been going to bed around 11:30 PM but not falling asleep until after midnight. Let's work on optimizing your sleep routine.",
    isUser: false,
    type: 'insight'
  },
  {
    text: "How did you know that? That's exactly what's been happening!",
    isUser: true,
    type: 'text'
  },
  {
    text: "I analyze your sleep data to identify patterns and trends. Here are 3 personalized recommendations to help you fall asleep faster:\n\n🌙 Try a 'wind-down' routine starting 30 minutes before bed\n📱 Reduce screen time after 10 PM\n🫖 Consider herbal tea or light stretching before bedtime",
    isUser: false,
    type: 'recommendation'
  },
  {
    text: "These suggestions sound really helpful! Can you track my progress?",
    isUser: true,
    type: 'text'
  },
  {
    text: "Absolutely! I'll monitor your sleep quality, track improvements, and adjust recommendations based on what works best for you. Think of me as your personal sleep coach, available 24/7 to help you achieve better rest. 😴✨",
    isUser: false,
    type: 'insight'
  }
];

export default function AiChatScreen({ onNext }: AiChatScreenProps) {
  const colorScheme = useColorScheme();
  const primaryColorRaw = useThemeColor({}, 'tint');
  const primaryColor = typeof primaryColorRaw === 'string' ? primaryColorRaw : '#5B21B6';
  const backgroundColorRaw = useThemeColor({}, 'background');
  const backgroundColor = typeof backgroundColorRaw === 'string' ? backgroundColorRaw : '#F8FAFC';
  
  // State for chat demo
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isDemoComplete, setIsDemoComplete] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
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

  
  const addMessage = useCallback((messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Haptic feedback for new messages
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);
  
  const startChatDemo = useCallback(() => {
    if (currentMessageIndex >= DEMO_MESSAGES.length) {
      setIsDemoComplete(true);
      return;
    }
    
    const message = DEMO_MESSAGES[currentMessageIndex];
    
    if (message.isUser) {
      // User messages appear immediately
      addMessage(message);
      setCurrentMessageIndex(prev => prev + 1);
      
      // Continue with next message after short delay
      setTimeout(() => startChatDemo(), 1000);
    } else {
      // AI messages show typing indicator first
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        addMessage(message);
        setCurrentMessageIndex(prev => prev + 1);
        
        // Continue with next message
        setTimeout(() => startChatDemo(), 1500);
      }, 2000 + Math.random() * 1000); // Vary typing time
    }
  }, [currentMessageIndex, addMessage]);
  
  const handleTryLuna = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onNext?.();
  };
  
  const resetDemo = () => {
    setMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setIsDemoComplete(false);
    
    setTimeout(() => {
      startChatDemo();
    }, 500);
  };

  // Start demo after animations
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      startChatDemo();
    }, 2000);
    
    return () => clearTimeout(demoTimeout);
  }, [startChatDemo]);
  
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
            <ThemedView style={styles.lunaContainer}>
              {/* Glow effect */}
              <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
              
              <Animated.View style={[styles.lunaAvatar, lunaAnimatedStyle]}>
                <LinearGradient
                  colors={[
                    colorScheme === 'dark' ? '#8B5CF6' : '#5B21B6',
                    colorScheme === 'dark' ? '#A78BFA' : '#7C3AED',
                  ]}
                  style={styles.avatarGradient}
                >
                  <IconSymbol
                    size={32}
                    color="white"
                    name="moon.stars.fill"
                  />
                </LinearGradient>
              </Animated.View>
            </ThemedView>
            
            <HeroText style={styles.title}>
              Meet Luna
            </HeroText>
            
            <TitleText style={styles.subtitle}>
              Your AI Sleep Assistant
            </TitleText>
            
            <BodyText style={styles.description}>
              Luna uses advanced AI to understand your sleep patterns,
              provide personalized insights, and help you achieve better rest.
            </BodyText>
          </Animated.View>
          
          {/* Chat Demo Section */}
          <Animated.View style={[styles.chatSection, chatAnimatedStyle]}>
            <ThemedView style={styles.chatHeader}>
              <ThemedView style={styles.chatHeaderLeft}>
                <ThemedView style={[styles.statusDot, { backgroundColor: Colors.semantic.success }]} />
                <CaptionText style={styles.chatTitle}>
                  Chat Preview
                </CaptionText>
              </ThemedView>
              
              {isDemoComplete && (
                <ThemedButton
                  title=""
                  variant="ghost"
                  size="small"
                  onPress={resetDemo}
                >
                  <IconSymbol size={16} color={primaryColor} name="arrow.clockwise" />
                </ThemedButton>
              )}
            </ThemedView>
            
            <ThemedView style={[styles.chatContainer, {
              borderColor: colorScheme === 'dark' 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'rgba(226, 232, 240, 0.8)'
            }]}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesContent}
              >
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                  />
                ))}
                
                {isTyping && (
                  <TypingIndicator 
                    isVisible={isTyping} 
                    aiName="Luna" 
                  />
                )}
              </ScrollView>
            </ThemedView>
          </Animated.View>
          
          {/* Features Section */}
          <Animated.View style={[styles.featuresSection, featuresAnimatedStyle]}>
            <TitleText style={styles.featuresTitle}>
              What Luna Can Do
            </TitleText>
            
            <ThemedView style={styles.featuresGrid}>
              <ThemedView style={[styles.featureCard, {
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(30, 27, 60, 0.6)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: colorScheme === 'dark'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(226, 232, 240, 0.6)'
              }]}>
                <IconSymbol size={24} color={Colors.sleepStages.rem} name="chart.line.uptrend.xyaxis" />
                <BodyText style={styles.featureTitle}>
                  Sleep Analysis
                </BodyText>
                <CaptionText style={styles.featureDescription}>
                  Detailed insights into your sleep quality, patterns, and trends
                </CaptionText>
              </ThemedView>
              
              <ThemedView style={[styles.featureCard, {
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(30, 27, 60, 0.6)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: colorScheme === 'dark'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(226, 232, 240, 0.6)'
              }]}>
                <IconSymbol size={24} color={Colors.semantic.info} name="lightbulb.fill" />
                <BodyText style={styles.featureTitle}>
                  Smart Suggestions
                </BodyText>
                <CaptionText style={styles.featureDescription}>
                  Personalized recommendations to improve your sleep habits
                </CaptionText>
              </ThemedView>
              
              <ThemedView style={[styles.featureCard, {
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(30, 27, 60, 0.6)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: colorScheme === 'dark'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(226, 232, 240, 0.6)'
              }]}>
                <IconSymbol size={24} color={Colors.sleepStages.wake} name="target" />
                <BodyText style={styles.featureTitle}>
                  Goal Tracking
                </BodyText>
                <CaptionText style={styles.featureDescription}>
                  Monitor progress toward your sleep goals with gentle guidance
                </CaptionText>
              </ThemedView>
              
              <ThemedView style={[styles.featureCard, {
                backgroundColor: colorScheme === 'dark' 
                  ? 'rgba(30, 27, 60, 0.6)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: colorScheme === 'dark'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(226, 232, 240, 0.6)'
              }]}>
                <IconSymbol size={24} color={Colors.semantic.success} name="bubble.left.and.bubble.right.fill" />
                <BodyText style={styles.featureTitle}>
                  24/7 Support
                </BodyText>
                <CaptionText style={styles.featureDescription}>
                  Ask questions anytime and get helpful, understanding responses
                </CaptionText>
              </ThemedView>
            </ThemedView>
          </Animated.View>
          
          {/* Trust & Privacy Section */}
          <Animated.View style={[styles.trustSection, trustAnimatedStyle]}>
            <ThemedView style={[styles.trustCard, {
              backgroundColor: colorScheme === 'dark' 
                ? 'rgba(45, 27, 105, 0.4)' 
                : 'rgba(248, 250, 252, 0.8)',
              borderColor: colorScheme === 'dark'
                ? 'rgba(139, 92, 246, 0.3)'
                : 'rgba(91, 33, 182, 0.2)'
            }]}>
              <ThemedView style={styles.trustHeader}>
                <IconSymbol size={20} color={Colors.semantic.success} name="shield.checkered" />
                <BodyText style={styles.trustTitle}>
                  Privacy-First AI
                </BodyText>
              </ThemedView>
              
              <CaptionText style={styles.trustDescription}>
                Luna processes your data locally and securely. Your sleep information 
                stays on your device, and conversations are never stored or shared.
              </CaptionText>
            </ThemedView>
          </Animated.View>
        </ScrollView>
        
        {/* Action Button */}
        <Animated.View style={[styles.actionSection, buttonAnimatedStyle]}>
          <ThemedButton 
            title="Continue to Luna"
            variant="primary" 
            size="large" 
            fullWidth
            onPress={handleTryLuna}
          />
          
          <CaptionText style={styles.actionNote}>
            Start your AI-powered sleep journey
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
  },
  lunaContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  glowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    top: -10,
    left: -10,
  },
  lunaAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    maxWidth: '90%',
  },
  chatSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chatTitle: {
    fontWeight: '600',
    opacity: 0.8,
  },
  chatContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    height: 320,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
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
  featureCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 120,
  },
  featureTitle: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 16,
  },
  trustSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  trustCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trustTitle: {
    fontWeight: '600',
  },
  trustDescription: {
    opacity: 0.7,
    lineHeight: 18,
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