import React, { useEffect, useRef, memo, useState } from 'react';
import { StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import LazyComponent from '@/components/optimizations/LazyComponent';
import MessageBubble from './chat/MessageBubble';
import MessageStatus from './chat/MessageStatus';
import MessageTypeIndicator from './chat/MessageTypeIndicator';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
}

interface ChatBubbleProps {
  message: ChatMessage;
  onLongPress?: () => void;
  onRetryPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enableSwipeGestures?: boolean;
}

const ChatBubble = memo(({ 
  message, 
  onLongPress, 
  onRetryPress, 
  onSwipeLeft, 
  onSwipeRight, 
  enableSwipeGestures = true 
}: ChatBubbleProps) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [swipeActionTriggered, setSwipeActionTriggered] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const animationConfig = {
      duration: Platform.OS === 'ios' ? 250 : 200,
      useNativeDriver: true,
    };

    // Staggered entrance animation for better mobile UX
    const delay = message.isUser ? 50 : 150;
    
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          ...animationConfig,
        }),
      ]).start();
    }, delay);
  }, [scaleAnim, opacityAnim, message.isUser]);

  // Enhanced swipe gesture handling for mobile interactions
  const panGesture = Gesture.Pan()
    .enabled(enableSwipeGestures && !message.isUser) // Only enable for AI messages
    .onUpdate((event) => {
      if (Math.abs(event.translationX) > 10) {
        translateX.setValue(event.translationX * 0.3); // Dampened movement
      }
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.15;
      
      if (event.translationX > threshold && !swipeActionTriggered) {
        // Swipe right - could trigger "useful" action
        setSwipeActionTriggered(true);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onSwipeRight?.();
      } else if (event.translationX < -threshold && !swipeActionTriggered) {
        // Swipe left - could trigger "share" action
        setSwipeActionTriggered(true);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onSwipeLeft?.();
      }
      
      // Reset position with spring animation
      Animated.spring(translateX, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }).start(() => {
        setSwipeActionTriggered(false);
      });
    });

  const bubbleContent = (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: translateX }
          ],
        },
      ]}
    >
      <LazyComponent priority="high" delay={0}>
        {!message.isUser && message.type && message.type !== 'text' && (
          <MessageTypeIndicator type={message.type} />
        )}
        
        <MessageBubble 
          message={message} 
          onLongPress={onLongPress} 
        />
        
        {message.isUser && (
          <MessageStatus
            status={message.status}
            timestamp={message.timestamp}
            onRetryPress={onRetryPress}
          />
        )}
      </LazyComponent>
    </Animated.View>
  );

  // Wrap with gesture detector for mobile swipe interactions
  if (enableSwipeGestures && !message.isUser && isVisible) {
    return (
      <GestureDetector gesture={panGesture}>
        {bubbleContent}
      </GestureDetector>
    );
  }

  return bubbleContent;
});

ChatBubble.displayName = 'ChatBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    // Enhanced mobile touch targets
    minHeight: Platform.OS === 'ios' ? 44 : 48,
    paddingHorizontal: 4,
  },
});

export { ChatBubble };
export type { ChatMessage };