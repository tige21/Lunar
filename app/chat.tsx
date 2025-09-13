import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ChatBubbleSimple from '@/components/ui/ChatBubbleSimple';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { QuickSuggestions } from '@/components/ui/QuickSuggestions';
import { SmartReplies, generateSmartReplies } from '@/components/ui/SmartReplies';
import { TypingIndicator } from '@/components/ui/TypingIndicator';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useChatOptimization } from '@/hooks/useChatOptimization';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { mockSleepData, sleepAI } from '@/lib/chatAI';
import type { ChatMessage } from '@/lib/chatOptimization';

// Quick suggestions for better UX
const QUICK_SUGGESTIONS = [
  { id: '1', text: 'How did I sleep last night?', icon: 'moon.fill', category: 'analysis' as const },
  { id: '2', text: 'What can improve my sleep?', icon: 'star.fill', category: 'improvement' as const },
  { id: '3', text: 'Analyze my sleep trends', icon: 'chart.bar.fill', category: 'analysis' as const },
  { id: '4', text: 'Best bedtime for me?', icon: 'timer', category: 'routine' as const },
  { id: '5', text: 'I can\'t fall asleep', icon: 'exclamationmark.triangle.fill', category: 'troubleshooting' as const },
  { id: '6', text: 'Sleep environment tips', icon: 'house.fill', category: 'improvement' as const },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background') as string;
  const textColor = useThemeColor({}, 'text') as string;
  const tintColor = useThemeColor({}, 'tint') as string;

  // Use the optimized chat hook
  const {
    messages,
    isLoading,
    isTyping,
    isOffline,
    hasMoreMessages,
    isLoadingMore,
    currentLanguage,
    sendMessage,
    retryMessage,
    loadMoreMessages,
    switchLanguage,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
    getPerformanceReport,
    getMemoryUsage,
  } = useChatOptimization({
    onSendMessage: handleAIResponse,
    enablePerformanceMonitoring: __DEV__,
  });

  // AI response handler with optimized error handling
  async function handleAIResponse(userText: string, retryId?: string): Promise<ChatMessage> {
    try {
      // Update AI context with recent sleep data
      sleepAI.updateContext({
        recentSleepData: mockSleepData,
        userProfile: {
          chronotype: 'intermediate',
          sleepGoal: 8,
          preferredBedtime: '10:15 PM',
        },
        conversationHistory: messages.slice(-5).map(msg => ({
          userMessage: msg.isUser ? msg.text : '',
          aiResponse: !msg.isUser ? msg.text : '',
          timestamp: msg.timestamp,
        })).filter(item => item.userMessage || item.aiResponse)
      });

      // Generate AI response
      const response = await sleepAI.generateResponse(userText);
      
      // Create optimized response message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        type: response.type,
        status: 'sent',
      };

      return aiMessage;
    } catch (error) {
      console.error('AI Response Error:', error);
      throw error; // Let the hook handle retry logic
    }
  }

  // State management for UI components
  const [inputText, setInputText] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(true);
  const [smartReplies, setSmartReplies] = React.useState<{id: string, text: string, context?: string}[]>([]);

  // Handle message sending with UI state updates
  const handleSendMessage = useCallback(async (text: string, retryId?: string) => {
    if (!text.trim()) return;

    try {
      setInputText('');
      setShowSuggestions(false);
      setSmartReplies([]);

      await sendMessage(text, retryId);

      // Generate smart replies after successful AI response
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          const replies = generateSmartReplies(lastMessage.text);
          setSmartReplies(replies);
        }
      }, 300);
    } catch (error) {
      console.error('Send message failed:', error);
    }
  }, [sendMessage, messages]);

  // Memoized chat bubble component to prevent unnecessary re-renders
  const MemoizedChatBubble = React.memo(function MemoizedChatBubble({ 
    message, 
    onRetry 
  }: { 
    message: ChatMessage; 
    onRetry: (id: string) => void;
  }) {
    const handlePress = React.useCallback(() => {
      console.log('Message pressed:', message.id);
    }, [message.id]);

    const handleLongPress = React.useCallback(() => {
      Alert.alert(
        'Message Actions',
        'Choose an action for this message',
        [
          {
            text: 'Copy',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              Alert.alert('Copied', 'Message copied to clipboard');
            },
          },
          ...(message.status === 'error' ? [{
            text: 'Retry',
            onPress: () => onRetry(message.id),
          }] : []),
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }, [message.id, message.status, onRetry]);

    return (
      <ChatBubbleSimple 
        message={message}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    );
  });

  // Optimized message rendering with proper memoization
  const renderMessage = React.useCallback(({ item }: { item: ChatMessage }) => {
    return (
      <MemoizedChatBubble 
        message={item}
        onRetry={retryMessage}
      />
    );
  }, [retryMessage]);

  // Quick suggestion handler
  const handleSuggestionPress = useCallback((suggestion: any) => {
    handleSendMessage(suggestion.text);
  }, [handleSendMessage]);

  // Smart reply handler
  const handleSmartReplyPress = useCallback((reply: any) => {
    handleSendMessage(reply.text);
    setSmartReplies([]);
  }, [handleSendMessage]);

  // Memoized footer component to prevent unnecessary re-renders
  const MemoizedFooter = React.useMemo(() => {
    return (
      <>
        {isTyping && (
          <TypingIndicator 
            isVisible={isTyping} 
            aiName="Sleep Coach"
          />
        )}
        
        {smartReplies.length > 0 && (
          <SmartReplies
            replies={smartReplies}
            onReplyPress={handleSmartReplyPress}
            isVisible={!isTyping && smartReplies.length > 0}
          />
        )}
        
        {showSuggestions && messages.length <= 1 && (
          <QuickSuggestions
            suggestions={QUICK_SUGGESTIONS}
            onSuggestionPress={handleSuggestionPress}
            isVisible={showSuggestions}
          />
        )}
      </>
    );
  }, [isTyping, smartReplies, showSuggestions, messages.length, handleSmartReplyPress, handleSuggestionPress]);

  // Memoized keyboard offset calculation
  const keyboardOffset = useMemo(() => {
    return Platform.OS === 'ios' ? 90 + insets.bottom : 0;
  }, [insets.bottom]);

  // Optimized key extractor
  const keyExtractor = React.useCallback((item: ChatMessage) => item.id, []);

  // Performance monitoring (development only)
  React.useEffect(() => {
    if (__DEV__) {
      const interval = setInterval(() => {
        const report = getPerformanceReport();
        const memory = getMemoryUsage();
        
        if (report && memory > 25 * 1024 * 1024) { // Alert if over 25MB
          console.warn('Chat Memory Usage High:', {
            memoryMB: (memory / 1024 / 1024).toFixed(1),
            recommendations: report.recommendations,
          });
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [getPerformanceReport, getMemoryUsage]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      {/* Optimized FlatList with performance enhancements */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: Math.max(20, insets.bottom) }
        ]}
        showsVerticalScrollIndicator={false}
        
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={21}
        getItemLayout={undefined}
        
        // Scroll handling
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={8}
        
        // Load more functionality
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.1}
        
        // Header for load more indicator
        ListHeaderComponent={isLoadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText type="caption" style={styles.loadingText}>
              Loading more messages...
            </ThemedText>
          </View>
        ) : hasMoreMessages ? (
          <TouchableOpacity 
            style={styles.loadMoreButton} 
            onPress={loadMoreMessages}
            activeOpacity={0.7}
          >
            <ThemedText type="caption" style={[styles.loadMoreText, { color: tintColor }]}>
              Tap to load more messages
            </ThemedText>
          </TouchableOpacity>
        ) : null}
        
        // Footer components (memoized)
        ListFooterComponent={MemoizedFooter}
        
        // Accessibility
        accessible={true}
        accessibilityLabel="Chat messages"
        accessibilityRole="list"
      />

      {/* Optimized input area */}
      <ThemedView 
        style={[
          styles.inputContainer, 
          { 
            paddingBottom: Math.max(insets.bottom + 10, 25),
            backgroundColor: colorScheme === 'dark' 
              ? 'rgba(15, 10, 30, 0.95)' 
              : 'rgba(248, 250, 252, 0.95)',
          }
        ]}
      >
        {/* Offline indicator */}
        {isOffline && (
          <ThemedView style={[
            styles.offlineIndicator,
            { 
              backgroundColor: Colors.semantic.warning + '15',
              borderColor: Colors.semantic.warning + '30',
            }
          ]}>
            <IconSymbol 
              size={14} 
              color={Colors.semantic.warning} 
              name="wifi.slash" 
            />
            <ThemedText 
              type="caption" 
              style={[
                styles.offlineText,
                { color: Colors.semantic.warning, marginLeft: 6 }
              ]}
            >
              Offline - messages will be sent when connected
            </ThemedText>
          </ThemedView>
        )}

        {/* Language Switcher */}
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={switchLanguage}
          style={styles.languageSwitcher}
        />
        
        <ThemedView style={styles.inputWrapper}>
          {/* Enhanced input container */}
          <View style={[
            styles.inputContainer2,
            {
              borderColor: inputText.trim() 
                ? (tintColor as string) + '40'
                : (colorScheme === 'dark' ? '#374151' : '#E5E7EB'),
              backgroundColor: colorScheme === 'dark' 
                ? 'rgba(45, 27, 105, 0.9)' 
                : 'rgba(255, 255, 255, 0.95)',
              ...DesignTokens.shadows.soft,
            }
          ]}>
            {/* Input icon */}
            <View style={[
              styles.inputIcon,
              { backgroundColor: (tintColor as string) + '15' }
            ]}>
              <IconSymbol
                size={16}
                color={inputText.trim() 
                  ? (tintColor as string) 
                  : (colorScheme === 'dark' ? '#6B7280' : '#9CA3AF')
                }
                name={isTyping ? "moon.stars.fill" : "message.fill"}
              />
            </View>
            
            <TextInput
              style={[
                styles.textInput,
                { color: textColor }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isOffline 
                ? "Message will be sent when online..." 
                : "Ask about your sleep patterns..."}
              placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => {
                if (inputText.trim()) {
                  handleSendMessage(inputText);
                }
              }}
              enablesReturnKeyAutomatically={true}
              accessible={true}
              accessibilityLabel="Sleep question input"
              accessibilityHint="Type your sleep-related question here"
            />
          </View>
          
          {/* Optimized Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                opacity: inputText.trim() ? 1 : 0.6,
                transform: [{ scale: inputText.trim() ? 1 : 0.95 }],
              }
            ]}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              handleSendMessage(inputText);
            }}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            {inputText.trim() ? (
              <LinearGradient
                colors={[
                  tintColor as string,
                  colorScheme === 'dark' ? '#7C3AED' : '#4C1D95'
                ]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconSymbol
                  size={20}
                  color="#FFFFFF"
                  name={isLoading ? "hourglass" : "paperplane.fill"}
                />
              </LinearGradient>
            ) : (
              <View style={[
                styles.sendButtonGradient,
                { backgroundColor: colorScheme === 'dark' ? '#374151' : '#9CA3AF' }
              ]}>
                <IconSymbol
                  size={20}
                  color="#FFFFFF"
                  name="paperplane.fill"
                />
              </View>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  languageSwitcher: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    gap: 12,
  },
  inputContainer2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    fontFamily: 'Inter',
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadows.medium,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});