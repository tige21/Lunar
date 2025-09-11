// import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
// import {
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   RefreshControl,
//   Alert,
//   Animated,
//   InteractionManager,
//   LayoutAnimation,
//   View,
//   AppState,
// } from 'react-native';
// import NetInfo from '@react-native-community/netinfo';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Haptics from 'expo-haptics';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { useThemeColor } from '@/hooks/useThemeColor';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { Colors, DesignTokens } from '@/constants/Colors';
// import { sleepAI, mockSleepData } from '@/lib/chatAI';
// import { ChatBubble } from '@/components/ui/ChatBubble';
// import { TypingIndicator } from '@/components/ui/TypingIndicator';
// import { QuickSuggestions } from '@/components/ui/QuickSuggestions';
// import type { QuickSuggestion } from '@/components/ui/QuickSuggestions';
// import { SmartReplies, generateSmartReplies } from '@/components/ui/SmartReplies';
// import { MessageReactions, type MessageReaction } from '@/components/ui/MessageReactions';
// import { RichContent, type RichContentData } from '@/components/ui/RichContent';
// import { VoiceInput } from '@/components/ui/VoiceInput';

// interface ChatMessage {
//   id: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date;
//   type?: 'text' | 'insight' | 'recommendation' | 'question';
//   status?: 'sending' | 'sent' | 'error';
//   retryCount?: number;
// }

// // Performance constants
// const MAX_MESSAGES_IN_MEMORY = 100;
// const MESSAGE_BATCH_SIZE = 20;
// const PAGINATION_THRESHOLD = 10;
// const RETRY_DELAYS = [1000, 2000, 5000]; // Exponential backoff
// const MAX_RETRY_ATTEMPTS = 3;

// // Memory management utility
// class MessageCache {
//   private cache = new Map<string, ChatMessage>();
//   private accessOrder: string[] = [];
//   private maxSize = MAX_MESSAGES_IN_MEMORY;

//   set(message: ChatMessage) {
//     if (this.cache.has(message.id)) {
//       this.updateAccessOrder(message.id);
//     } else {
//       if (this.cache.size >= this.maxSize) {
//         this.evictLeastRecent();
//       }
//       this.accessOrder.push(message.id);
//     }
//     this.cache.set(message.id, message);
//   }

//   get(id: string): ChatMessage | undefined {
//     const message = this.cache.get(id);
//     if (message) {
//       this.updateAccessOrder(id);
//     }
//     return message;
//   }

//   getAll(): ChatMessage[] {
//     return Array.from(this.cache.values()).sort((a, b) => 
//       a.timestamp.getTime() - b.timestamp.getTime()
//     );
//   }

//   private updateAccessOrder(id: string) {
//     const index = this.accessOrder.indexOf(id);
//     if (index > -1) {
//       this.accessOrder.splice(index, 1);
//     }
//     this.accessOrder.push(id);
//   }

//   private evictLeastRecent() {
//     const lruId = this.accessOrder.shift();
//     if (lruId) {
//       this.cache.delete(lruId);
//     }
//   }

//   clear() {
//     this.cache.clear();
//     this.accessOrder = [];
//   }
// }


// const QUICK_SUGGESTIONS: QuickSuggestion[] = [
//   { id: '1', text: 'How did I sleep last night?', icon: 'moon.fill', category: 'analysis' },
//   { id: '2', text: 'What can improve my sleep?', icon: 'star.fill', category: 'improvement' },
//   { id: '3', text: 'Analyze my sleep trends', icon: 'chart.bar.fill', category: 'analysis' },
//   { id: '4', text: 'Best bedtime for me?', icon: 'timer', category: 'routine' },
//   { id: '5', text: 'I can\'t fall asleep', icon: 'exclamationmark.triangle.fill', category: 'troubleshooting' },
//   { id: '6', text: 'Sleep environment tips', icon: 'house.fill', category: 'improvement' },
// ];

// const CHAT_STORAGE_KEY = 'lunar_chat_history';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [isLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(true);
//   const [smartReplies, setSmartReplies] = useState<{id: string, text: string, context?: string}[]>([]);
//   const [isOffline, setIsOffline] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [hasMoreMessages, setHasMoreMessages] = useState(false);
//   const [networkRetryQueue, setNetworkRetryQueue] = useState<string[]>([]);
  
//   // Performance optimization refs
//   const messageCache = useRef(new MessageCache()).current;
//   const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
//   const isScrollingRef = useRef(false);
//   const keyboardHeightRef = useRef(0);
//   const lastScrollPositionRef = useRef(0);
  
//   const flatListRef = useRef<FlatList>(null);
//   const inputRef = useRef<TextInput>(null);
//   const keyboardAnimationRef = useRef(new Animated.Value(0)).current;
  
//   const insets = useSafeAreaInsets();
//   const colorScheme = useColorScheme();
//   const backgroundColor = useThemeColor({}, 'background') as string;
//   const textColor = useThemeColor({}, 'text') as string;
//   const tintColor = useThemeColor({}, 'tint') as string;

//   // Load chat history on mount with performance optimization
//   useEffect(() => {
//     let mounted = true;
    
//     InteractionManager.runAfterInteractions(async () => {
//       if (mounted) {
//         await loadChatHistory();
//         setupNetworkListener();
//         setupAppStateListener();
//       }
//     });

//     return () => {
//       mounted = false;
//       cleanupRetryTimeouts();
//     };
//   }, []);

//   // Network state monitoring for offline functionality
//   const setupNetworkListener = useCallback(() => {
//     const unsubscribe = NetInfo.addEventListener((state: any) => {
//       const wasOffline = isOffline;
//       const nowOffline = !state.isConnected;
      
//       setIsOffline(nowOffline);
      
//       // Retry queued messages when coming back online
//       if (wasOffline && !nowOffline && networkRetryQueue.length > 0) {
//         networkRetryQueue.forEach(messageId => {
//           const message = messages.find(m => m.id === messageId);
//           if (message && message.status === 'error') {
//             handleRetryMessage(messageId);
//           }
//         });
//         setNetworkRetryQueue([]);
//       }
//     });
    
//     return unsubscribe;
//   }, [isOffline, networkRetryQueue, messages, handleRetryMessage]);

//   // App state listener for memory management
//   const setupAppStateListener = useCallback(() => {
//     const handleAppStateChange = (nextAppState: string) => {
//       if (nextAppState === 'background') {
//         // Clear animations and timers when app goes to background
//         cleanupRetryTimeouts();
//         // Optionally save state
//         saveChatHistory(messages);
//       }
//     };
    
//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => subscription?.remove();
//   }, [messages]);

//   const cleanupRetryTimeouts = useCallback(() => {
//     retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
//     retryTimeouts.current.clear();
//   }, []);

//   // Optimized keyboard handling with better performance
//   useEffect(() => {
//     const keyboardWillShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       (event) => {
//         keyboardHeightRef.current = event.endCoordinates.height;
        
//         // Use native driver for better performance
//         Animated.timing(keyboardAnimationRef, {
//           toValue: 1,
//           duration: Platform.OS === 'ios' ? 250 : 150,
//           useNativeDriver: true,
//         }).start();
        
//         // Debounced scroll to bottom to prevent excessive scrolling
//         if (!isScrollingRef.current) {
//           InteractionManager.runAfterInteractions(() => {
//             flatListRef.current?.scrollToEnd({ animated: true });
//           });
//         }
//       }
//     );

//     const keyboardWillHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         keyboardHeightRef.current = 0;
        
//         Animated.timing(keyboardAnimationRef, {
//           toValue: 0,
//           duration: Platform.OS === 'ios' ? 250 : 150,
//           useNativeDriver: true,
//         }).start();
//       }
//     );

//     return () => {
//       keyboardWillShowListener?.remove();
//       keyboardWillHideListener?.remove();
//     };
//   }, [keyboardAnimationRef]);

//   // Optimized auto-scroll with performance checks
//   useEffect(() => {
//     if (messages.length > 0) {
//       // Only animate if we're near the bottom to avoid jarring experiences
//       const shouldAnimate = lastScrollPositionRef.current > 0.9;
      
//       if (shouldAnimate) {
//         LayoutAnimation.configureNext({
//           duration: 150, // Shorter duration for snappier feel
//           create: { type: 'easeInEaseOut', property: 'opacity' },
//           update: { type: 'easeInEaseOut' },
//         });
//       }
      
//       // Use InteractionManager for smooth scrolling
//       InteractionManager.runAfterInteractions(() => {
//         if (!isScrollingRef.current) {
//           const scrollDelay = shouldAnimate ? 100 : 0;
//           setTimeout(() => {
//             flatListRef.current?.scrollToEnd({ animated: shouldAnimate });
//           }, scrollDelay);
//         }
//       });
//     }
//   }, [messages.length]);


//   const loadChatHistory = async (loadMore = false, offset = 0) => {
//     try {
//       if (loadMore) {
//         setIsLoadingMore(true);
//       }
      
//       const storedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
//       if (storedMessages) {
//         const allMessages = JSON.parse(storedMessages).map((msg: any) => ({
//           ...msg,
//           timestamp: new Date(msg.timestamp),
//         }));
        
//         // Implement pagination for better performance
//         const totalMessages = allMessages.length;
//         const startIndex = Math.max(0, totalMessages - MESSAGE_BATCH_SIZE - offset);
//         const endIndex = totalMessages - offset;
//         const messagesToLoad = allMessages.slice(startIndex, endIndex);
        
//         // Update cache
//         messagesToLoad.forEach(msg => messageCache.set(msg));
        
//         if (loadMore) {
//           // Prepend older messages
//           setMessages(prev => [...messagesToLoad, ...prev]);
//           setHasMoreMessages(startIndex > 0);
//         } else {
//           // Initial load - get most recent messages
//           const recentMessages = allMessages.slice(-MESSAGE_BATCH_SIZE);
//           recentMessages.forEach(msg => messageCache.set(msg));
//           setMessages(recentMessages);
//           setHasMoreMessages(allMessages.length > MESSAGE_BATCH_SIZE);
//         }
//       } else if (!loadMore) {
//         // Add welcome message only on initial load
//         const welcomeMessage: ChatMessage = {
//           id: Date.now().toString(),
//           text: "Hi! I'm your AI sleep coach. I'm here to help you understand your sleep patterns and improve your rest.\n\nI can help you with:\n• Analyzing your sleep data and trends\n• Personalized recommendations for better sleep\n• Troubleshooting sleep issues\n• Optimizing your bedtime and environment\n\nWhat would you like to explore about your sleep today?",
//           isUser: false,
//           timestamp: new Date(),
//           type: 'insight',
//         };
//         messageCache.set(welcomeMessage);
//         setMessages([welcomeMessage]);
//         setHasMoreMessages(false);
//       }
//     } catch (error) {
//       console.error('Error loading chat history:', error);
//     } finally {
//       if (loadMore) {
//         setIsLoadingMore(false);
//       }
//     }
//   };

//   const saveChatHistory = useCallback(async (updatedMessages: ChatMessage[]) => {
//     try {
//       // Batch save operations and limit storage size
//       const messagesToSave = updatedMessages.slice(-MAX_MESSAGES_IN_MEMORY);
//       await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
//     } catch (error) {
//       console.error('Error saving chat history:', error);
//       // Implement fallback storage or user notification
//     }
//   }, []);

//   const sendMessage = useCallback(async (text: string, retryMessageId?: string) => {
//     if (!text.trim()) return;

//     // Enhanced haptic feedback with platform optimization
//     if (Platform.OS === 'ios') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }

//     let userMessage: ChatMessage;
//     let updatedMessages: ChatMessage[];

//     if (retryMessageId) {
//       // Handle retry scenario with exponential backoff
//       const retryCount = (messages.find(m => m.id === retryMessageId)?.retryCount || 0) + 1;
      
//       // Cancel any existing retry timeout
//       const existingTimeout = retryTimeouts.current.get(retryMessageId);
//       if (existingTimeout) {
//         clearTimeout(existingTimeout);
//         retryTimeouts.current.delete(retryMessageId);
//       }
      
//       updatedMessages = messages.map(msg => 
//         msg.id === retryMessageId 
//           ? { ...msg, status: 'sending' as const, retryCount }
//           : msg
//       );
//       userMessage = updatedMessages.find(msg => msg.id === retryMessageId)!;
//     } else {
//       // New message with optimistic ID generation
//       userMessage = {
//         id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//         text: text.trim(),
//         isUser: true,
//         timestamp: new Date(),
//         status: 'sending' as const,
//         retryCount: 0,
//       };
//       updatedMessages = [...messages, userMessage];
//       setInputText('');
      
//       // Update cache immediately
//       messageCache.set(userMessage);
//     }

//     setMessages(updatedMessages);
//     setShowSuggestions(false);
//     setIsTyping(true);
//     setSmartReplies([]);

//     try {
//       // Mark user message as sent
//       const sentMessage = { ...userMessage, status: 'sent' as const };
//       const messagesWithSent = updatedMessages.map(msg => 
//         msg.id === userMessage.id ? sentMessage : msg
//       );
//       setMessages(messagesWithSent);

//       // Get AI response
//       const aiResponse = await getAIResponse(text, messages);
      
//       // Realistic typing simulation with variable delay based on response length
//       const typingDelay = Math.min(2000, Math.max(800, aiResponse.text.length * 20));
      
//       setTimeout(() => {
//         setIsTyping(false);
//         const aiMessage: ChatMessage = {
//           id: (Date.now() + 1).toString(),
//           text: aiResponse.text,
//           isUser: false,
//           timestamp: new Date(),
//           type: aiResponse.type,
//           status: 'sent' as const,
//         };
        
//         const finalMessages = [...messagesWithSent, aiMessage];
//         setMessages(finalMessages);
//         saveChatHistory(finalMessages);
        
//         // Generate smart replies with slight delay for better UX
//         setTimeout(() => {
//           const replies = generateSmartReplies(aiMessage.text);
//           setSmartReplies(replies);
//         }, 300);
        
//         // Success haptic feedback
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       }, typingDelay);
      
//     } catch (error) {
//       setIsTyping(false);
//       console.error('AI Response Error:', error);
      
//       // Mark user message as error
//       const errorMessage = { ...userMessage, status: 'error' as const };
//       const messagesWithError = updatedMessages.map(msg => 
//         msg.id === userMessage.id ? errorMessage : msg
//       );
      
//       setMessages(messagesWithError);
      
//       // Add to retry queue if network is offline
//       if (isOffline) {
//         setNetworkRetryQueue(prev => [...prev, userMessage.id]);
//       }
      
//       // Implement exponential backoff for retry
//       const retryCount = userMessage.retryCount || 0;
//       if (retryCount < 3) { // MAX_RETRY_ATTEMPTS
//         const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
//         const retryTimeout = setTimeout(() => {
//           handleRetryMessage(userMessage.id);
//           retryTimeouts.current.delete(userMessage.id);
//         }, delay);
//         retryTimeouts.current.set(userMessage.id, retryTimeout);
//       }
      
//       // Platform-specific error feedback
//       if (Platform.OS === 'ios') {
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       }
      
//       // Provide contextual offline response with performance optimization
//       InteractionManager.runAfterInteractions(() => {
//         setTimeout(() => {
//           const offlineResponse: ChatMessage = {
//             id: `${Date.now() + 1}-offline`,
//             text: `I'm having trouble connecting right now, but I can still help with some general sleep advice!\n\n🌙 **Quick Sleep Tips**:\n• Keep a consistent sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool (65-68°F)\n• Avoid screens 1 hour before bed\n• Try the 4-7-8 breathing technique\n\nTap the retry button above to try your question again when connection improves.`,
//             isUser: false,
//             timestamp: new Date(),
//             type: 'recommendation',
//             status: 'sent' as const,
//           };
          
//           messageCache.set(offlineResponse);
//           const finalMessages = [...messagesWithError, offlineResponse];
//           setMessages(finalMessages);
//           saveChatHistory(finalMessages);
//         }, 300); // Reduced delay for better UX
//       });
//     }
//   }, [messages]);

//   const getAIResponse = async (userText: string, chatHistory: ChatMessage[]): Promise<{text: string, type: ChatMessage['type']}> => {
//     try {
//       // Update AI context with recent sleep data
//       sleepAI.updateContext({
//         recentSleepData: mockSleepData,
//         userProfile: {
//           chronotype: 'intermediate',
//           sleepGoal: 8,
//           preferredBedtime: '10:15 PM',
//         },
//         conversationHistory: chatHistory.slice(-5).map(msg => ({
//           userMessage: msg.isUser ? msg.text : '',
//           aiResponse: !msg.isUser ? msg.text : '',
//           timestamp: msg.timestamp,
//         })).filter(item => item.userMessage || item.aiResponse)
//       });

//       // Generate AI response using the service
//       const response = await sleepAI.generateResponse(userText);
      
//       return {
//         text: response.text,
//         type: response.type
//       };
//     } catch (error) {
//       console.error('AI Response Error:', error);
//       return {
//         text: "I'm having trouble processing that right now. Could you try rephrasing your question? I'm here to help with your sleep patterns, recommendations, and any sleep-related concerns you have.",
//         type: 'text'
//       };
//     }
//   };

//   const handleSuggestionPress = (suggestion: QuickSuggestion) => {
//     sendMessage(suggestion.text);
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     // Simulate refresh delay
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     await loadChatHistory();
//     setRefreshing(false);
//   }, []);


//   const handleRetryMessage = useCallback((messageId: string) => {
//     const message = messages.find(msg => msg.id === messageId) || messageCache.get(messageId);
//     if (message && message.status === 'error') {
//       // Clear from retry queue
//       setNetworkRetryQueue(prev => prev.filter(id => id !== messageId));
//       sendMessage(message.text, messageId);
//     }
//   }, [messages, messageCache, sendMessage]);

//   // Load more messages for pagination
//   const loadMoreMessages = useCallback(async () => {
//     if (!isLoadingMore && hasMoreMessages) {
//       await loadChatHistory(true, messages.length);
//     }
//   }, [isLoadingMore, hasMoreMessages, loadChatHistory, messages.length]);

//   // Scroll position tracking for performance optimization
//   const handleScroll = useCallback((event: any) => {
//     const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
//     const scrollPosition = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
//     lastScrollPositionRef.current = scrollPosition;
    
//     // Trigger load more when near top
//     if (contentOffset.y < 100 && hasMoreMessages && !isLoadingMore) {
//       loadMoreMessages();
//     }
//   }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

//   const handleScrollBeginDrag = useCallback(() => {
//     isScrollingRef.current = true;
//   }, []);

//   const handleScrollEndDrag = useCallback(() => {
//     isScrollingRef.current = false;
//   }, []);

//   const handleMessageAction = useCallback((message: ChatMessage, action: 'copy' | 'share' | 'retry') => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
//     switch (action) {
//       case 'retry':
//         if (message.status === 'error') {
//           handleRetryMessage(message.id);
//         }
//         break;
//       case 'copy':
//         // TODO: Implement copy to clipboard
//         Alert.alert('Copied', 'Message copied to clipboard');
//         break;
//       case 'share':
//         // TODO: Implement share functionality
//         Alert.alert('Share', 'Share functionality coming soon');
//         break;
//     }
//   }, [handleRetryMessage]);

//   // Optimized message rendering with getItemLayout for better performance
//   const getItemLayout = useCallback((_: any, index: number) => {
//     const ESTIMATED_ITEM_HEIGHT = 120; // Approximate message height
//     return {
//       length: ESTIMATED_ITEM_HEIGHT,
//       offset: ESTIMATED_ITEM_HEIGHT * index,
//       index,
//     };
//   }, []);

//   const renderMessage = useCallback(({ item, index }: { item: ChatMessage; index: number }) => {
//     return (
//       <ChatBubble 
//         message={item}
//         onLongPress={() => {
//           const actions = ['Copy'];
//           if (!item.isUser) actions.push('Share');
//           if (item.status === 'error') actions.unshift('Retry');
          
//           Alert.alert(
//             'Message Actions',
//             `Choose an action for this message`,
//             [
//               ...actions.map(action => ({
//                 text: action,
//                 onPress: () => handleMessageAction(item, action.toLowerCase() as any),
//               })),
//               { text: 'Cancel', style: 'cancel' },
//             ]
//           );
//         }}
//         onRetryPress={item.status === 'error' ? () => handleRetryMessage(item.id) : undefined}
//       />
//     );
//   }, [handleMessageAction, handleRetryMessage]);

//   const renderTypingIndicator = () => {
//     return (
//       <TypingIndicator 
//         isVisible={isTyping} 
//         aiName="Sleep Coach"
//       />
//     );
//   };

//   const renderSuggestions = () => {
//     return (
//       <QuickSuggestions
//         suggestions={QUICK_SUGGESTIONS}
//         onSuggestionPress={handleSuggestionPress}
//         isVisible={showSuggestions && messages.length <= 1}
//       />
//     );
//   };

//   const renderSmartReplies = () => {
//     // Show smart replies after AI messages (but not during typing)
//     const shouldShow = !isTyping && 
//                       smartReplies.length > 0 && 
//                       messages.length > 0 &&
//                       !messages[messages.length - 1]?.isUser;
    
//     return (
//       <SmartReplies
//         replies={smartReplies}
//         onReplyPress={(reply) => {
//           sendMessage(reply.text);
//           setSmartReplies([]); // Clear smart replies after selection
//         }}
//         isVisible={shouldShow}
//       />
//     );
//   };

//   // Memoize expensive computations
//   const memoizedMessages = useMemo(() => messages, [messages]);
//   const keyboardOffset = useMemo(() => {
//     return Platform.OS === 'ios' ? 90 + insets.bottom : 0;
//   }, [insets.bottom]);

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor }]}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={keyboardOffset}
//     >
//       {/* Optimized Chat Messages with enhanced performance */}
//       <FlatList
//         ref={flatListRef}
//         data={memoizedMessages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         style={styles.messagesList}
//         contentContainerStyle={[
//           styles.messagesContainer,
//           { paddingBottom: Math.max(20, insets.bottom) }
//         ]}
//         showsVerticalScrollIndicator={false}
//         // Enhanced performance optimizations
//         removeClippedSubviews={Platform.OS === 'android'} // iOS has issues with this
//         maxToRenderPerBatch={8} // Reduced for better performance
//         updateCellsBatchingPeriod={100} // Increased for smoother scrolling
//         initialNumToRender={12} // Reduced initial render
//         windowSize={8} // Reduced window size
//         getItemLayout={getItemLayout} // Enable for performance boost
//         // Scroll optimizations
//         onScroll={handleScroll}
//         onScrollBeginDrag={handleScrollBeginDrag}
//         onScrollEndDrag={handleScrollEndDrag}
//         scrollEventThrottle={16} // 60fps scroll updates
//         // Enhanced refresh control
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={tintColor}
//             colors={[tintColor]}
//             progressBackgroundColor={backgroundColor}
//           />
//         }
//         ListFooterComponent={() => (
//           <>
//             {renderTypingIndicator()}
//             {renderSmartReplies()}
//             {renderSuggestions()}
//           </>
//         )}
//         ListHeaderComponent={isLoadingMore ? (
//           <View style={styles.loadingMore}>
//             <ThemedText type="caption">Loading more messages...</ThemedText>
//           </View>
//         ) : null}
//         onScrollToIndexFailed={() => {}}
//         // Accessibility
//         accessible={true}
//         accessibilityLabel="Chat messages"
//         accessibilityRole="list"
//         // Memory optimization
//         onEndReachedThreshold={0.1}
//         maintainVisibleContentPosition={{
//           minIndexForVisible: 0,
//           autoscrollToTopThreshold: 100,
//         }}
//       />

//       {/* Premium Enhanced Input Area */}
//       <Animated.View style={styles.inputAnimationContainer}>
//         <ThemedView 
//           style={[
//             styles.inputContainer, 
//             { 
//               paddingBottom: Math.max(insets.bottom + 10, 25),
//               backgroundColor: colorScheme === 'dark' 
//                 ? 'rgba(15, 10, 30, 0.95)' 
//                 : 'rgba(248, 250, 252, 0.95)',
//             }
//           ]}
//         >
//           {/* Sleep-themed background gradient overlay */}
//           <View style={styles.inputBackgroundOverlay}>
//             <View 
//               style={[
//                 styles.inputGradientBar,
//                 { 
//                   backgroundColor: tintColor as string,
//                   opacity: inputText.trim() ? 0.6 : 0.2,
//                 }
//               ]} 
//             />
//           </View>
          
//           {isOffline && (
//             <ThemedView style={[
//               styles.offlineIndicator,
//               { 
//                 backgroundColor: Colors.semantic.warning + '15',
//                 borderColor: Colors.semantic.warning + '30',
//               }
//             ]}>
//               <IconSymbol 
//                 size={14} 
//                 color={Colors.semantic.warning} 
//                 name="wifi.slash" 
//               />
//               <ThemedText 
//                 type="caption" 
//                 style={[
//                   styles.offlineText,
//                   { color: Colors.semantic.warning, marginLeft: 6 }
//                 ]}
//               >
//                 Limited connectivity - some features unavailable
//               </ThemedText>
//             </ThemedView>
//           )}
          
//           <ThemedView style={styles.inputWrapper}>
//             {/* Enhanced input container with sleep theme */}
//             <View style={[
//               styles.inputContainer2,
//               {
//                 borderColor: inputText.trim() 
//                   ? (tintColor as string) + '40'
//                   : (colorScheme === 'dark' ? '#374151' : '#E5E7EB'),
//                 backgroundColor: colorScheme === 'dark' ? 'rgba(45, 27, 105, 0.9)' : 'rgba(255, 255, 255, 0.95)',
//                 ...DesignTokens.shadows.soft,
//               }
//             ]}>
//               {/* Sleep-themed input icon */}
//               <View style={[
//                 styles.inputIcon,
//                 { backgroundColor: (tintColor as string) + '15' }
//               ]}>
//                 <IconSymbol
//                   size={16}
//                   color={inputText.trim() ? (tintColor as string) : (colorScheme === 'dark' ? '#6B7280' : '#9CA3AF')}
//                   name={isTyping ? "moon.stars.fill" : "message.fill"}
//                 />
//               </View>
              
//               <TextInput
//                 ref={inputRef}
//                 style={[
//                   styles.textInput,
//                   {
//                     color: textColor,
//                   }
//                 ]}
//                 value={inputText}
//                 onChangeText={setInputText}
//                 placeholder={isOffline 
//                   ? "Ask a simple sleep question..." 
//                   : "What would you like to know about your sleep?"}
//                 placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
//                 multiline
//                 maxLength={500}
//                 returnKeyType="send"
//                 onSubmitEditing={() => {
//                   if (inputText.trim()) {
//                     sendMessage(inputText);
//                   }
//                 }}
//                 enablesReturnKeyAutomatically={true}
//                 accessible={true}
//                 accessibilityLabel="Sleep question input"
//                 accessibilityHint="Type your sleep-related question here"
//               />
//             </View>
            
//             {/* Premium Send Button */}
//             <TouchableOpacity
//               style={[
//                 styles.sendButton,
//                 {
//                   opacity: inputText.trim() ? 1 : 0.6,
//                   transform: [{ scale: inputText.trim() ? 1 : 0.95 }],
//                 }
//               ]}
//               onPress={() => {
//                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//                 sendMessage(inputText);
//               }}
//               disabled={!inputText.trim() || isLoading}
//               activeOpacity={0.8}
//               accessible={true}
//               accessibilityLabel="Send message"
//               accessibilityRole="button"
//             >
//               {inputText.trim() ? (
//                 <LinearGradient
//                   colors={[
//                     tintColor as string,
//                     colorScheme === 'dark' ? '#7C3AED' : '#4C1D95'
//                   ]}
//                   style={styles.sendButtonGradient}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                 >
//                   <IconSymbol
//                     size={20}
//                     color="#FFFFFF"
//                     name={isLoading ? "hourglass" : "paperplane.fill"}
//                   />
//                 </LinearGradient>
//               ) : (
//                 <View style={[
//                   styles.sendButtonGradient,
//                   { backgroundColor: colorScheme === 'dark' ? '#374151' : '#9CA3AF' }
//                 ]}>
//                   <IconSymbol
//                     size={20}
//                     color="#FFFFFF"
//                     name="paperplane.fill"
//                   />
//                 </View>
//               )}
//             </TouchableOpacity>
//           </ThemedView>
//         </ThemedView>
//       </Animated.View>
//     </KeyboardAvoidingView>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   messagesList: {
//     flex: 1,
//   },
//   messagesContainer: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   inputAnimationContainer: {
//     position: 'relative',
//   },
//   inputContainer: {
//     paddingTop: 16,
//     paddingHorizontal: 20,
//     position: 'relative',
//   },
//   inputBackgroundOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 4,
//   },
//   inputGradientBar: {
//     height: '100%',
//     borderTopLeftRadius: 2,
//     borderTopRightRadius: 2,
//   },
//   offlineIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     marginBottom: 12,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     justifyContent: 'center',
//   },
//   offlineText: {
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     backgroundColor: 'transparent',
//     gap: 12,
//   },
//   inputContainer2: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderRadius: 28,
//     paddingHorizontal: 4,
//     paddingVertical: 4,
//     minHeight: 56,
//   },
//   inputIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 4,
//   },
//   textInput: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     maxHeight: 120,
//     fontFamily: 'Inter',
//     textAlignVertical: 'top',
//     lineHeight: 22,
//   },
//   sendButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//     ...DesignTokens.shadows.medium,
//   },
//   sendButtonGradient: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingMore: {
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });