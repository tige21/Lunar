/**
 * Optimized Chat Hook for Mobile Performance
 * Handles all chat operations with memory management, network optimization, and native mobile patterns
 */

import {
  ChatPerformanceMonitor,
  ChatStorageManager,
  OptimizedMessageCache,
  PERFORMANCE_CONFIG,
  RetryManager,
  throttle,
  type ChatMessage
} from '@/lib/chatOptimization';
import { sleepAI } from '@/lib/chatAI';
import type { SupportedLanguage } from '@/lib/languageDetection';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, InteractionManager, Platform } from 'react-native';

interface UseChatOptimizationProps {
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string, retryId?: string) => Promise<ChatMessage>;
  enablePerformanceMonitoring?: boolean;
}

interface UseChatOptimizationReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  isOffline: boolean;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  currentLanguage: SupportedLanguage;
  
  // Actions
  sendMessage: (text: string, retryId?: string) => Promise<void>;
  retryMessage: (messageId: string) => void;
  loadMoreMessages: () => Promise<void>;
  clearHistory: () => Promise<void>;
  switchLanguage: (language: SupportedLanguage) => Promise<void>;
  
  // Performance
  getPerformanceReport: () => any;
  getMemoryUsage: () => number;
  
  // AI Status
  getAIHealthStatus: () => Promise<any>;
  getConversationStats: () => any;
  
  // UI Helpers
  handleScroll: (event: any) => void;
  handleScrollBegin: () => void;
  handleScrollEnd: () => void;
  getItemLayout: (data: any, index: number) => { length: number; offset: number; index: number };
}

export function useChatOptimization({
  initialMessages = [],
  onSendMessage,
  enablePerformanceMonitoring = __DEV__,
}: UseChatOptimizationProps): UseChatOptimizationReturn {
  
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Performance optimization refs
  const messageCache = useRef(new OptimizedMessageCache()).current;
  const retryManager = useRef(new RetryManager()).current;
  const storageManager = useRef(new ChatStorageManager()).current;
  const performanceMonitor = useRef(new ChatPerformanceMonitor()).current;
  
  // UI state refs
  const isScrollingRef = useRef(false);
  const lastScrollPositionRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  
  // Network state management
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const nowOffline = !state.isConnected;
      
      setIsOffline(nowOffline);
      
      // Process retry queue when coming back online
      if (wasOffline && !nowOffline) {
        const queuedRetries = retryManager.getQueuedRetries();
        queuedRetries.forEach(messageId => {
          retryMessage(messageId);
        });
      }
    });
    
    return unsubscribe;
  }, [isOffline, retryMessage]);
  
  // App state management for performance
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // Save state and cleanup when app goes to background
        if (messages.length > 0) {
          storageManager.saveMessages(messages);
        }
        retryManager.clearAll();
      } else if (nextAppState === 'active') {
        // Restore state when app becomes active
        if (enablePerformanceMonitoring) {
          performanceMonitor.recordMemoryUsage(messageCache.getMemoryUsage());
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [messages, messageCache, retryManager, storageManager, performanceMonitor, enablePerformanceMonitoring]);
  
  // Load initial messages
  useEffect(() => {
    let mounted = true;
    
    InteractionManager.runAfterInteractions(async () => {
      if (mounted) {
        await loadInitialMessages();
      }
    });
    
    return () => {
      mounted = false;
      retryManager.clearAll();
    };
  }, []);
  
  // Load initial messages from storage
  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (enablePerformanceMonitoring) {
        performanceMonitor.startTimer('loadMessages');
      }
      
      const result = await storageManager.loadMessages(0, PERFORMANCE_CONFIG.MESSAGE_BATCH_SIZE);
      
      if (result.messages.length > 0) {
        // Update cache
        result.messages.forEach(msg => messageCache.set(msg));
        setMessages(result.messages);
        setHasMoreMessages(result.hasMore);
      } else {
        // Create welcome message if no history
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          text: "Hi! I'm your AI sleep coach. I'm here to help you understand your sleep patterns and improve your rest.\\n\\nI can help you with:\\n• Analyzing your sleep data and trends\\n• Personalized recommendations for better sleep\\n• Troubleshooting sleep issues\\n• Optimizing your bedtime and environment\\n\\nWhat would you like to explore about your sleep today?",
          isUser: false,
          timestamp: new Date(),
          type: 'insight',
          status: 'sent',
        };
        
        messageCache.set(welcomeMessage);
        setMessages([welcomeMessage]);
        setHasMoreMessages(false);
      }
      
      if (enablePerformanceMonitoring) {
        performanceMonitor.endTimer('loadMessages');
      }
    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messageCache, storageManager, performanceMonitor, enablePerformanceMonitoring]);
  
  // Load more messages for pagination
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    try {
      setIsLoadingMore(true);
      
      const currentOffset = messages.length;
      const result = await storageManager.loadMessages(currentOffset, PERFORMANCE_CONFIG.MESSAGE_BATCH_SIZE);
      
      if (result.messages.length > 0) {
        // Update cache and prepend messages
        result.messages.forEach(msg => messageCache.set(msg));
        setMessages(prev => [...result.messages, ...prev]);
        setHasMoreMessages(result.hasMore);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreMessages, messages.length, messageCache, storageManager]);
  
  // Optimized send message with retry logic
  const sendMessage = useCallback(async (text: string, retryId?: string) => {
    if (!text.trim()) return;
    
    // Platform-specific haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (enablePerformanceMonitoring) {
      performanceMonitor.startTimer('sendMessage');
    }
    
    let userMessage: ChatMessage;
    
    if (retryId) {
      // Retry existing message
      const existingMessage = messageCache.get(retryId);
      if (!existingMessage) return;
      
      userMessage = {
        ...existingMessage,
        status: 'sending',
        retryCount: (existingMessage.retryCount || 0) + 1,
      };
      
      retryManager.cancelRetry(retryId);
    } else {
      // New message
      userMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
        status: 'sending',
        retryCount: 0,
      };
    }
    
    // Update cache and state optimistically
    messageCache.set(userMessage);
    
    if (retryId) {
      setMessages(prev => prev.map(msg => msg.id === retryId ? userMessage : msg));
    } else {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setIsTyping(true);
    
    try {
      // Mark as sent
      const sentMessage = { ...userMessage, status: 'sent' as const };
      messageCache.set(sentMessage);
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? sentMessage : msg));
      
      // Get AI response if handler provided
      if (onSendMessage) {
        if (enablePerformanceMonitoring) {
          performanceMonitor.startTimer('aiResponse');
        }
        
        const aiResponse = await onSendMessage(text, retryId);
        
        if (enablePerformanceMonitoring) {
          performanceMonitor.endTimer('aiResponse');
        }
        
        // Add AI response
        messageCache.set(aiResponse);
        setMessages(prev => [...prev, aiResponse]);
        
        // Save to storage
        const updatedMessages = [...messages, sentMessage, aiResponse];
        await storageManager.saveMessages(updatedMessages);
        
        // Platform-specific success feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      
      if (enablePerformanceMonitoring) {
        performanceMonitor.endTimer('sendMessage');
      }
    } catch (error) {
      console.error('Send message error:', error);
      
      // Mark as error
      const errorMessage = { ...userMessage, status: 'error' as const };
      messageCache.set(errorMessage);
      setMessages(prev => prev.map(msg => msg.id === userMessage.id ? errorMessage : msg));
      
      // Add to retry queue if not exceeded max attempts
      if ((userMessage.retryCount || 0) < PERFORMANCE_CONFIG.MAX_RETRY_ATTEMPTS) {
        retryManager.addToRetryQueue(errorMessage);
        
        // Schedule automatic retry
        retryManager.scheduleRetry(errorMessage.id, (message) => {
          sendMessage(message.text, message.id);
        });
      }
      
      // Platform-specific error feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsTyping(false);
    }
  }, [messageCache, messages, retryManager, storageManager, onSendMessage, enablePerformanceMonitoring, performanceMonitor]);
  
  // Retry message
  const retryMessage = useCallback((messageId: string) => {
    const message = messageCache.get(messageId);
    if (message && message.status === 'error') {
      sendMessage(message.text, messageId);
    }
  }, [messageCache, sendMessage]);
  
  // Clear chat history
  const clearHistory = useCallback(async () => {
    try {
      await storageManager.clearHistory();
      messageCache.clear();
      retryManager.clearAll();
      setMessages([]);
      setHasMoreMessages(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [messageCache, retryManager, storageManager]);
  
  // Performance monitoring
  const getPerformanceReport = useCallback(() => {
    return enablePerformanceMonitoring ? performanceMonitor.getPerformanceReport() : null;
  }, [enablePerformanceMonitoring, performanceMonitor]);
  
  const getMemoryUsage = useCallback(() => {
    return messageCache.getMemoryUsage();
  }, [messageCache]);
  
  // Optimized scroll handlers
  const handleScroll = useCallback(throttle((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
    lastScrollPositionRef.current = scrollPosition;
    scrollOffsetRef.current = contentOffset.y;
    
    // Trigger load more when near top
    if (contentOffset.y < 100 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  }, PERFORMANCE_CONFIG.SCROLL_THROTTLE), [hasMoreMessages, isLoadingMore, loadMoreMessages]);
  
  const handleScrollBegin = useCallback(() => {
    isScrollingRef.current = true;
  }, []);
  
  const handleScrollEnd = useCallback(() => {
    isScrollingRef.current = false;
    
    // Record scroll performance if monitoring enabled
    if (enablePerformanceMonitoring) {
      performanceMonitor.recordMemoryUsage(messageCache.getMemoryUsage());
    }
  }, [enablePerformanceMonitoring, performanceMonitor, messageCache]);
  
  // Optimized getItemLayout for FlatList performance
  const getItemLayout = useCallback((_: any, index: number) => {
    const ESTIMATED_ITEM_HEIGHT = Platform.OS === 'ios' ? 120 : 110;
    return {
      length: ESTIMATED_ITEM_HEIGHT,
      offset: ESTIMATED_ITEM_HEIGHT * index,
      index,
    };
  }, []);
  
  // Language management
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  
  // Update current language from sleepAI
  useEffect(() => {
    const updateLanguage = () => {
      const lang = sleepAI.getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    updateLanguage();
    // Update periodically in case language changes elsewhere
    const interval = setInterval(updateLanguage, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Language switching function
  const switchLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await sleepAI.setLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  }, []);

  // AI health status
  const getAIHealthStatus = useCallback(async () => {
    return sleepAI.getHealthStatus();
  }, []);

  // Conversation statistics
  const getConversationStats = useCallback(() => {
    return sleepAI.getConversationStats();
  }, []);

  // Memoized messages for performance
  const memoizedMessages = useMemo(() => messages, [messages]);
  
  return {
    // State
    messages: memoizedMessages,
    isLoading,
    isTyping,
    isOffline,
    hasMoreMessages,
    isLoadingMore,
    currentLanguage,
    
    // Actions
    sendMessage,
    retryMessage,
    loadMoreMessages,
    clearHistory,
    switchLanguage,
    
    // Performance
    getPerformanceReport,
    getMemoryUsage,
    
    // AI Status
    getAIHealthStatus,
    getConversationStats,
    
    // UI Helpers
    handleScroll,
    handleScrollBegin: handleScrollBegin,
    handleScrollEnd: handleScrollEnd,
    getItemLayout,
  };
}