import React, { memo, useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoicePress?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const ChatInput = memo(({ 
  onSendMessage, 
  onVoicePress, 
  isLoading = false,
  placeholder = "Ask about your sleep...",
  maxLength = 500
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({ light: '#F8F9FA', dark: '#1A1A1A' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');

  // Animation values
  const focusAnimation = useSharedValue(0);
  const sendButtonScale = useSharedValue(0);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    const borderColorAnimated = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [borderColor, primaryColor]
    );

    return {
      borderColor: borderColorAnimated,
      borderWidth: withSpring(focusAnimation.value === 1 ? 2 : 1),
    };
  });

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  // Handlers
  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withSpring(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withSpring(0);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSendMessage(trimmedMessage);
      setMessage('');
      sendButtonScale.value = withSpring(0);
    }
  };

  const handleVoicePress = () => {
    if (onVoicePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onVoicePress();
    }
  };

  // Update send button scale based on message content
  React.useEffect(() => {
    sendButtonScale.value = withSpring(message.trim().length > 0 ? 1 : 0);
  }, [message, sendButtonScale]);

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom}
    >
      <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={[
          styles.inputContainer,
          { backgroundColor },
          containerStyle
        ]}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              { color: useThemeColor({}, 'text') }
            ]}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            value={message}
            onChangeText={setMessage}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline
            maxLength={maxLength}
            scrollEnabled={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />

          <View style={styles.buttonContainer}>
            {message.trim().length > 0 ? (
              <Animated.View style={sendButtonStyle}>
                <Pressable
                  style={[
                    styles.sendButton,
                    { 
                      backgroundColor: canSend ? primaryColor : borderColor,
                      opacity: canSend ? 1 : 0.5
                    }
                  ]}
                  onPress={handleSend}
                  disabled={!canSend}
                >
                  <IconSymbol
                    name={isLoading ? "clock" : "arrow.up"}
                    size={20}
                    color="#FFFFFF"
                  />
                </Pressable>
              </Animated.View>
            ) : (
              onVoicePress && (
                <Pressable
                  style={[styles.voiceButton, { borderColor }]}
                  onPress={handleVoicePress}
                >
                  <IconSymbol
                    name="mic"
                    size={20}
                    color={primaryColor}
                  />
                </Pressable>
              )
            )}
          </View>
        </Animated.View>

        {/* Character count indicator */}
        {message.length > maxLength * 0.8 && (
          <View style={styles.characterCount}>
            <ThemedText style={[
              styles.characterCountText,
              { color: message.length >= maxLength ? '#EF4444' : placeholderColor }
            ]}>
              {message.length}/{maxLength}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
});

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 80,
    marginRight: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginRight: 8,
  },
  characterCountText: {
    fontSize: 12,
  },
});

export default ChatInput;