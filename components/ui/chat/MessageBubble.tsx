import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
}

interface MessageBubbleProps {
  message: ChatMessage;
  onLongPress?: () => void;
}

const MessageBubble = memo(({ message, onLongPress }: MessageBubbleProps) => {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const { isUser, status } = message;
  const hasError = status === 'error';

  const getUserColors = () => {
    if (hasError) {
      return ['#EF4444', '#DC2626'];
    }
    return colorScheme === 'dark' 
      ? ['#5B21B6', '#4C1D95'] 
      : ['#6366F1', '#5B21B6'];
  };

  const getAIColors = () => {
    return colorScheme === 'dark'
      ? ['rgba(30, 27, 60, 0.95)', 'rgba(45, 27, 105, 0.95)']
      : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)'];
  };

  const getBorderColor = () => {
    if (isUser) return 'transparent';
    return colorScheme === 'dark' 
      ? 'rgba(139, 92, 246, 0.3)' 
      : 'rgba(226, 232, 240, 0.8)';
  };

  const handlePress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  if (isUser) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={getUserColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.userBubble]}
          >
            <ThemedText style={[styles.messageText, styles.userText]}>
              {message.text}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.aiContainer]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={getAIColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            styles.aiBubble,
            { borderColor: getBorderColor() },
            Platform.select({
              ios: {
                shadowColor: tintColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          ]}
        >
          <ThemedText style={[styles.messageText, styles.aiText, { color: textColor }]}>
            {message.text}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    opacity: 0.9,
  },
});

export default MessageBubble;