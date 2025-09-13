import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedView, ThemedText } from '@/components/ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

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
  onPress?: () => void;
  onLongPress?: () => void;
}

const ChatBubbleSimple = memo(({ message, onPress, onLongPress }: ChatBubbleProps) => {
  const backgroundColor = useThemeColor({}, 'surface');
  const userBubbleColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  };

  return (
    <ThemedView style={[styles.container, message.isUser ? styles.userContainer : styles.botContainer]}>
      <TouchableOpacity
        style={[
          styles.bubble,
          {
            backgroundColor: message.isUser ? userBubbleColor : backgroundColor,
            borderColor: message.isUser ? userBubbleColor : backgroundColor,
          }
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <ThemedText 
          style={[
            styles.text,
            { color: message.isUser ? '#FFFFFF' : textColor }
          ]}
        >
          {message.text}
        </ThemedText>

        {message.status && (
          <ThemedText style={styles.status}>
            {message.status === 'sending' && '⏳'}
            {message.status === 'sent' && '✓'}
            {message.status === 'error' && '❌'}
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
});

ChatBubbleSimple.displayName = 'ChatBubbleSimple';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  status: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
});

export default ChatBubbleSimple;