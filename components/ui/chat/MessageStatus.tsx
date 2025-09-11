import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'error';
  timestamp: Date;
  onRetryPress?: () => void;
}

const MessageStatus = memo(({ status, timestamp, onRetryPress }: MessageStatusProps) => {
  const mutedColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
  const errorColor = Colors.semantic.error;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'sending') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={mutedColor} />
        <ThemedText style={[styles.statusText, { color: mutedColor }]}>
          Sending...
        </ThemedText>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <IconSymbol name="exclamationmark.triangle" size={14} color={errorColor} />
        <ThemedText style={[styles.statusText, { color: errorColor }]}>
          Failed to send
        </ThemedText>
        {onRetryPress && (
          <TouchableOpacity onPress={onRetryPress} style={styles.retryButton}>
            <ThemedText style={[styles.retryText, { color: errorColor }]}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.timeText, { color: mutedColor }]}>
        {formatTime(timestamp)}
      </ThemedText>
    </View>
  );
});

MessageStatus.displayName = 'MessageStatus';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
  },
  retryButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MessageStatus;