import React, { memo, useCallback, useMemo } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  RefreshControl, 
  ListRenderItem,
  View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { TypingIndicator } from '@/components/ui/TypingIndicator';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
  retryCount?: number;
}

interface MessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onRetryMessage?: (messageId: string) => void;
  onLoadMore?: () => void;
  inverted?: boolean;
}

// Memoized empty state component
const EmptyState = memo(() => {
  const textColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
  
  return (
    <Animated.View 
      entering={FadeInUp.springify()}
      style={styles.emptyContainer}
    >
      <ThemedText style={[styles.emptyText, { color: textColor }]}>
        👋 Welcome to Sleep AI Chat!
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: textColor }]}>
        Ask me anything about your sleep patterns, tips for better rest, or sleep health insights.
      </ThemedText>
    </Animated.View>
  );
});

EmptyState.displayName = 'EmptyState';

// Memoized message item component
const MessageItem = memo(({ 
  item, 
  onRetryMessage 
}: { 
  item: ChatMessage; 
  onRetryMessage?: (messageId: string) => void;
}) => {
  const handleRetry = useCallback(() => {
    if (onRetryMessage && item.status === 'error') {
      onRetryMessage(item.id);
    }
  }, [item.id, item.status, onRetryMessage]);

  return (
    <Animated.View entering={FadeInUp.delay(50).springify()}>
      <ChatBubble
        message={item.text}
        isUser={item.isUser}
        timestamp={item.timestamp}
        status={item.status}
        type={item.type}
        onRetry={item.status === 'error' ? handleRetry : undefined}
        style={styles.messageBubble}
      />
    </Animated.View>
  );
});

MessageItem.displayName = 'MessageItem';

const MessagesList = memo(({ 
  messages, 
  isTyping, 
  isRefreshing, 
  onRefresh, 
  onRetryMessage,
  onLoadMore,
  inverted = true
}: MessagesListProps) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Memoize the render item function
  const renderItem: ListRenderItem<ChatMessage> = useCallback((info) => (
    <MessageItem 
      item={info.item} 
      onRetryMessage={onRetryMessage}
    />
  ), [onRetryMessage]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  // Memoize list footer (typing indicator)
  const ListFooterComponent = useMemo(() => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <TypingIndicator />
      </View>
    );
  }, [isTyping]);

  // Memoize list empty component
  const ListEmptyComponent = useMemo(() => {
    if (isRefreshing) return null;
    return <EmptyState />;
  }, [isRefreshing]);

  // Handle end reached for pagination
  const handleEndReached = useCallback(() => {
    if (onLoadMore && messages.length > 0) {
      onLoadMore();
    }
  }, [onLoadMore, messages.length]);

  // Memoize refresh control
  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      colors={[tintColor]}
    />
  ), [isRefreshing, onRefresh, tintColor]);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted={inverted}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { flexGrow: messages.length === 0 ? 1 : 0 }
        ]}
        refreshControl={refreshControl}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={undefined} // Let FlatList calculate automatically for variable heights
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </ThemedView>
  );
});

MessagesList.displayName = 'MessagesList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    marginVertical: 4,
  },
  typingContainer: {
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default MessagesList;