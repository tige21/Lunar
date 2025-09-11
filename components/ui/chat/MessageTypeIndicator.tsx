import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

type MessageType = 'insight' | 'recommendation' | 'question';

interface MessageTypeIndicatorProps {
  type: MessageType;
}

const MessageTypeIndicator = memo(({ type }: MessageTypeIndicatorProps) => {
  const colorScheme = useColorScheme();

  const getTypeConfig = (messageType: MessageType) => {
    switch (messageType) {
      case 'insight':
        return {
          icon: 'lightbulb' as const,
          label: 'Sleep Insight',
          colors: ['#10B981', '#059669'],
          bgColors: colorScheme === 'dark' 
            ? ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']
            : ['rgba(16, 185, 129, 0.05)', 'rgba(5, 150, 105, 0.05)'],
        };
      case 'recommendation':
        return {
          icon: 'star' as const,
          label: 'Recommendation',
          colors: ['#F59E0B', '#D97706'],
          bgColors: colorScheme === 'dark'
            ? ['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.1)']
            : ['rgba(245, 158, 11, 0.05)', 'rgba(217, 119, 6, 0.05)'],
        };
      case 'question':
        return {
          icon: 'questionmark.circle' as const,
          label: 'Question',
          colors: ['#3B82F6', '#2563EB'],
          bgColors: colorScheme === 'dark'
            ? ['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']
            : ['rgba(59, 130, 246, 0.05)', 'rgba(37, 99, 235, 0.05)'],
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <LinearGradient
      colors={config.bgColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <LinearGradient
          colors={config.colors}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconSymbol
            size={12}
            color="white"
            name={config.icon}
          />
        </LinearGradient>
        <ThemedText style={[styles.label, { color: config.colors[0] }]}>
          {config.label}
        </ThemedText>
      </View>
    </LinearGradient>
  );
});

MessageTypeIndicator.displayName = 'MessageTypeIndicator';

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MessageTypeIndicator;