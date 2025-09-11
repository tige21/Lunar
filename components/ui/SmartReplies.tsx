import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SmartReply {
  id: string;
  text: string;
  context?: string; // The topic this reply relates to
}

interface SmartRepliesProps {
  replies: SmartReply[];
  onReplyPress: (reply: SmartReply) => void;
  isVisible?: boolean;
}

// Context-aware reply suggestions based on the last AI message
export function generateSmartReplies(lastAIMessage: string): SmartReply[] {
  const message = lastAIMessage.toLowerCase();
  
  // Sleep score related replies
  if (message.includes('sleep score') || message.includes('score')) {
    return [
      { id: '1', text: 'How can I improve it?', context: 'improvement' },
      { id: '2', text: 'Show my score history', context: 'analysis' },
      { id: '3', text: 'What\'s a good score?', context: 'education' },
    ];
  }

  // Bedtime advice replies
  if (message.includes('bedtime') || message.includes('10:15')) {
    return [
      { id: '1', text: 'Set bedtime reminder', context: 'action' },
      { id: '2', text: 'Why this time for me?', context: 'explanation' },
      { id: '3', text: 'Weekend schedule?', context: 'routine' },
    ];
  }

  // Improvement recommendations replies
  if (message.includes('recommendation') || message.includes('improve')) {
    return [
      { id: '1', text: 'Start with #1', context: 'action' },
      { id: '2', text: 'Why these specific tips?', context: 'explanation' },
      { id: '3', text: 'More suggestions?', context: 'exploration' },
    ];
  }

  // Sleep analysis replies
  if (message.includes('trend') || message.includes('pattern') || message.includes('analysis')) {
    return [
      { id: '1', text: 'Focus on weekends?', context: 'specific' },
      { id: '2', text: 'Compare to last month', context: 'comparison' },
      { id: '3', text: 'Set improvement goals', context: 'action' },
    ];
  }

  // Problem solving replies
  if (message.includes('trouble') || message.includes('insomnia') || message.includes('fall asleep')) {
    return [
      { id: '1', text: 'Try tonight\'s plan', context: 'action' },
      { id: '2', text: 'Other techniques?', context: 'exploration' },
      { id: '3', text: 'Track my progress', context: 'monitoring' },
    ];
  }

  // Environment advice replies
  if (message.includes('temperature') || message.includes('environment') || message.includes('room')) {
    return [
      { id: '1', text: 'Check my room setup', context: 'assessment' },
      { id: '2', text: 'Best temperature range?', context: 'specific' },
      { id: '3', text: 'Light management tips', context: 'related' },
    ];
  }

  // Default contextual replies
  return [
    { id: '1', text: 'Tell me more', context: 'exploration' },
    { id: '2', text: 'What else?', context: 'continuation' },
    { id: '3', text: 'How do I start?', context: 'action' },
  ];
}

export function SmartReplies({ 
  replies, 
  onReplyPress, 
  isVisible = true 
}: SmartRepliesProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint') as string;
  const textColor = useThemeColor({}, 'text') as string;
  
  const getContextTheme = (context?: string) => {
    switch (context) {
      case 'action':
        return {
          colors: ['#10B981', '#059669'],
          bgGradient: ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.25)'],
          icon: 'play.circle.fill',
          emoji: '▶️',
        };
      case 'explanation':
        return {
          colors: ['#3B82F6', '#2563EB'],
          bgGradient: ['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.25)'],
          icon: 'lightbulb.fill',
          emoji: '💡',
        };
      case 'exploration':
        return {
          colors: ['#8B5CF6', '#5B21B6'],
          bgGradient: ['rgba(139, 92, 246, 0.15)', 'rgba(91, 33, 182, 0.25)'],
          icon: 'magnifyingglass.circle.fill',
          emoji: '🔍',
        };
      case 'assessment':
        return {
          colors: ['#F59E0B', '#D97706'],
          bgGradient: ['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.25)'],
          icon: 'checkmark.circle.fill',
          emoji: '✅',
        };
      default:
        return {
          colors: [tintColor, tintColor + 'CC'],
          bgGradient: [tintColor + '15', tintColor + '25'],
          icon: 'bubble.right.fill',
          emoji: '💬',
        };
    }
  };
  
  const handleReplyPress = (reply: SmartReply) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReplyPress(reply);
  };

  if (!isVisible || replies.length === 0) return null;

  return (
    <ThemedView 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Quick reply suggestions"
      accessibilityRole="list"
    >
      {/* Enhanced header for smart replies */}
      <ThemedView style={styles.header}>
        <ThemedView style={[
          styles.headerIcon,
          { backgroundColor: tintColor + '20' }
        ]}>
          <IconSymbol
            size={12}
            color={tintColor}
            name="bolt.fill"
          />
        </ThemedView>
        <ThemedText 
          type="caption" 
          style={[
            styles.headerText,
            { color: textColor + 'CC', fontWeight: '600' }
          ]}
        >
          QUICK REPLIES
        </ThemedText>
      </ThemedView>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessible={false}
        decelerationRate="fast"
      >
        {replies.map((reply, index) => {
          const theme = getContextTheme(reply.context);
          return (
            <TouchableOpacity
              key={reply.id}
              style={styles.replyButton}
              onPress={() => handleReplyPress(reply)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={`Quick reply: ${reply.text}`}
              accessibilityRole="button"
              accessibilityHint="Sends this message to the AI"
            >
              <View style={styles.replyContainer}>
                {/* Background gradient for context */}
                <LinearGradient
                  colors={theme.bgGradient}
                  style={styles.replyBackdrop}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                
                <LinearGradient
                  colors={[
                    colorScheme === 'dark' 
                      ? 'rgba(45, 27, 105, 0.95)'
                      : 'rgba(255, 255, 255, 0.98)',
                    colorScheme === 'dark' 
                      ? 'rgba(59, 26, 120, 0.9)'
                      : 'rgba(248, 250, 252, 0.95)'
                  ]}
                  style={[
                    styles.replyGradient,
                    {
                      borderWidth: 2,
                      borderColor: theme.colors[0] + '50',
                      shadowColor: theme.colors[0] + '40',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                {/* Enhanced context indicator */}
                <View style={styles.contextWrapper}>
                  <LinearGradient
                    colors={theme.colors}
                    style={styles.contextIndicator}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconSymbol
                      size={14}
                      color="white"
                      name={theme.icon as any}
                    />
                  </LinearGradient>
                  {/* Subtle glow */}
                  <View 
                    style={[
                      styles.contextGlow,
                      { backgroundColor: theme.colors[0] + '30' }
                    ]} 
                  />
                </View>
                
                <View style={styles.replyTextContainer}>
                  <ThemedText 
                    style={[
                      styles.replyText,
                      { color: textColor }
                    ]}
                    numberOfLines={2}
                  >
                    {reply.text}
                  </ThemedText>
                  {/* Context accent */}
                  <View style={[
                    styles.replyAccent,
                    { backgroundColor: theme.colors[0] + '40' }
                  ]} />
                </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  headerIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerText: {
    fontSize: 11.5,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  replyButton: {
    marginRight: 14,
    minWidth: 110,
    maxWidth: screenWidth * 0.48,
  },
  // Enhanced reply container
  replyContainer: {
    position: 'relative',
    borderRadius: 26,
  },
  replyBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    zIndex: 0,
  },
  replyGradient: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
    zIndex: 1,
  },
  // Enhanced context indicator
  contextWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  contextIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    zIndex: -1,
  },
  // Enhanced text container
  replyTextContainer: {
    flex: 1,
    position: 'relative',
  },
  replyText: {
    fontSize: 14.5,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 19,
  },
  replyAccent: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
});