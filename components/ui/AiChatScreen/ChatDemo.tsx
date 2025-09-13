import {
    CaptionText,
    ThemedButton,
    ThemedView,
    type ChatMessage
} from '@/components/ui';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TypingIndicator } from '@/components/ui/TypingIndicator';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LOCALIZED_MESSAGES, TIMING_CONFIG, TRANSLATIONS } from './messages';
import { ChatDemoProps, DemoMessage } from './types';

const ChatDemo = React.memo<ChatDemoProps>(({ language }) => {
  const colorScheme = useColorScheme();
  const primaryColorRaw = useThemeColor({}, 'tint');
  const primaryColor = typeof primaryColorRaw === 'string' ? primaryColorRaw : '#5B21B6';

  // Memoize demo messages for current language
  const demoMessages = useMemo(() => LOCALIZED_MESSAGES[language], [language]);
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // State for chat demo
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isDemoComplete, setIsDemoComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate typing duration based on message length
  const calculateTypingDuration = useCallback((message: DemoMessage): number => {
    const textLength = message.text.length;
    const typingTime = Math.max(
      TIMING_CONFIG.minTypingTime,
      Math.min(textLength * TIMING_CONFIG.typingSpeed, TIMING_CONFIG.maxTypingTime)
    );
    
    // Add extra delay for insights
    const extraDelay = message.type === 'insight' ? TIMING_CONFIG.postInsightDelay : 0;
    
    return typingTime + extraDelay;
  }, []);
  
  const addMessage = useCallback((messageData: DemoMessage) => {
    try {
      const newMessage: ChatMessage = {
        ...messageData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);

      // Haptic feedback for new messages - wrapped in try-catch to prevent crashes
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Haptics not available:', error);
        }
      }

      // Auto-scroll to bottom with error handling - slower scroll
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
          console.warn('ScrollView scrollToEnd failed:', error);
        }
      }, 300); // Увеличено с 100 до 300ms для более плавного скролла
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }, []);
  
  const startChatDemo = useCallback(() => {
    if (isPaused || currentMessageIndex >= demoMessages.length) {
      setIsDemoComplete(true);
      return;
    }

    try {
      const message = demoMessages[currentMessageIndex];

      if (message.isUser) {
        // User messages appear immediately
        addMessage(message);
        setCurrentMessageIndex(prev => prev + 1);

        // Continue with next message after delay
        timeoutRef.current = setTimeout(() => startChatDemo(), TIMING_CONFIG.baseDelay[message.type]);
      } else {
        // AI messages show typing indicator first
        setIsTyping(true);

        const typingDuration = calculateTypingDuration(message);

        timeoutRef.current = setTimeout(() => {
          if (!isPaused) {
            setIsTyping(false);
            addMessage(message);
            setCurrentMessageIndex(prev => prev + 1);

            // Continue with next message after delay
            timeoutRef.current = setTimeout(() => startChatDemo(), TIMING_CONFIG.baseDelay[message.type]);
          }
        }, typingDuration);
      }
    } catch (error) {
      console.error('Error in chat demo:', error);
      setIsDemoComplete(true);
    }
  }, [currentMessageIndex, addMessage, demoMessages, calculateTypingDuration, isPaused]);
  
  const resetDemo = useCallback(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setIsDemoComplete(false);
    setIsPaused(false);

    setTimeout(() => {
      startChatDemo();
    }, 500);
  }, [startChatDemo]);

  // Handle chat area tap to pause/resume demo
  const handleChatTap = useCallback(() => {
    try {
      setIsPaused(prev => !prev);

      // Provide gentle haptic feedback
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Haptics not available:', error);
        }
      }
    } catch (error) {
      console.warn('Error handling chat tap:', error);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start demo after animations
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      startChatDemo();
    }, 1500); // 1.5 секунды перед началом демо (быстрее старт)

    return () => clearTimeout(demoTimeout);
  }, [startChatDemo]);
  
  return (
    <ThemedView style={styles.chatSection}>
      <ThemedView style={styles.chatHeader}>
        <ThemedView style={styles.chatHeaderLeft}>
          <ThemedView style={[styles.statusDot, { backgroundColor: Colors.semantic.success }]} />
          <CaptionText style={styles.chatTitle}>
            {t.chatPreview}
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
      
      <Pressable
        onPress={handleChatTap}
        style={[styles.chatContainer, {
          borderColor: colorScheme === 'dark'
            ? 'rgba(139, 92, 246, 0.3)'
            : 'rgba(226, 232, 240, 0.8)'
        }]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              enableSwipeGestures={false}
              onLongPress={() => {}}
            />
          ))}

          {isTyping && (
            <TypingIndicator
              isVisible={isTyping}
              aiName="Luna"
            />
          )}
        </ScrollView>

        {isPaused && (
          <ThemedView style={styles.pausedOverlay}>
            <CaptionText style={styles.pausedText}>
              {language === 'en' ? 'Demo paused - tap to resume' : 'Демо приостановлено - нажмите для продолжения'}
            </CaptionText>
          </ThemedView>
        )}
      </Pressable>
    </ThemedView>
  );
});

ChatDemo.displayName = 'ChatDemo';

const styles = StyleSheet.create({
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
    height: 420, // Увеличено с 320 до 420 для показа больше сообщений
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 12, // Уменьшено с 16 до 12 для экономии места
    paddingBottom: 16, // Уменьшено с 24 до 16
    minHeight: 400, // Минимальная высота для контента
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  pausedText: {
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default ChatDemo;