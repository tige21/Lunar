import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatHeaderProps {
  onSettingsPress?: () => void;
  onClearChat?: () => void;
  messageCount: number;
  delay?: number;
}

const ChatHeader = memo(({ 
  onSettingsPress, 
  onClearChat, 
  messageCount,
  delay = 0 
}: ChatHeaderProps) => {
  const primaryColor = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({ light: '#666666', dark: '#AAAAAA' }, 'text');

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <ThemedView style={styles.container}>
        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            Sleep AI Chat 🤖
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
            {messageCount > 0 ? `${messageCount} messages` : 'Ask me anything about your sleep'}
          </ThemedText>
        </View>
        
        <View style={styles.actionContainer}>
          {messageCount > 0 && onClearChat && (
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClearChat();
              }}
            >
              <IconSymbol 
                name="trash" 
                size={18} 
                color={primaryColor}
              />
            </Pressable>
          )}
          
          {onSettingsPress && (
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSettingsPress();
              }}
            >
              <IconSymbol 
                name="gear" 
                size={18} 
                color={primaryColor}
              />
            </Pressable>
          )}
        </View>
      </ThemedView>
    </Animated.View>
  );
});

ChatHeader.displayName = 'ChatHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatHeader;