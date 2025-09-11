import React, { useEffect, useRef, memo } from 'react';
import { StyleSheet, Animated, Platform } from 'react-native';
import LazyComponent from '@/components/optimizations/LazyComponent';
import MessageBubble from './chat/MessageBubble';
import MessageStatus from './chat/MessageStatus';
import MessageTypeIndicator from './chat/MessageTypeIndicator';

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
}

const ChatBubble = memo(({ message, onLongPress, onRetryPress }: ChatBubbleProps) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationConfig = {
      duration: Platform.OS === 'ios' ? 200 : 150,
      useNativeDriver: true,
    };

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        ...animationConfig,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        ...animationConfig,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
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
});

ChatBubble.displayName = 'ChatBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
});

export { ChatBubble };
export type { ChatMessage };