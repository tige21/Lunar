import React, { useEffect, useRef, memo } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, DesignTokens } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
  retryCount?: number;
}

interface ChatBubbleProps {
  message: ChatMessage;
  onLongPress?: () => void;
  onRetryPress?: () => void;
}

export const ChatBubble = memo(function ChatBubble({ message, onLongPress, onRetryPress }: ChatBubbleProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
  const errorColor = Colors.semantic.error;
  const isUser = message.isUser;
  const hasError = message.status === 'error';
  const isSending = message.status === 'sending';
  
  // Optimized animation refs with reduced complexity for mobile performance
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Simplified entrance animation for better performance
  useEffect(() => {
    // Use InteractionManager to ensure smooth animations
    const animationConfig = {
      duration: Platform.OS === 'ios' ? 250 : 200, // Faster on Android
      useNativeDriver: true,
    };
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        ...animationConfig,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animationConfig.duration + 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'insight':
        return { 
          icon: 'brain.head.profile', 
          gradient: ['#8B5CF6', '#5B21B6'], 
          bgGradient: ['rgba(139, 92, 246, 0.15)', 'rgba(91, 33, 182, 0.25)'],
          label: 'Sleep Analysis',
          emoji: '🧠'
        };
      case 'recommendation':
        return { 
          icon: 'heart.text.square.fill', 
          gradient: ['#10B981', '#059669'], 
          bgGradient: ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.25)'],
          label: 'Sleep Tip',
          emoji: '💡'
        };
      case 'question':
        return { 
          icon: 'questionmark.bubble.fill', 
          gradient: ['#F59E0B', '#D97706'], 
          bgGradient: ['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.25)'],
          label: 'Question',
          emoji: '❓'
        };
      default:
        return { 
          icon: 'message.fill', 
          gradient: [tintColor as string, tintColor as string],
          bgGradient: [tintColor + '15', tintColor + '25'],
          label: 'Message',
          emoji: '💬'
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageText = (text: string) => {
    // Simple markdown-like formatting for AI responses
    if (isUser) return text;
    
    // Bold text **text**
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    return formattedText;
  };

  // Enhanced color calculations with glass morphism
  const getUserGradientColors = () => {
    if (hasError) {
      return ['rgba(239, 68, 68, 0.85)', 'rgba(220, 38, 38, 0.95)'];
    }
    return colorScheme === 'dark' 
      ? ['rgba(139, 92, 246, 0.95)', 'rgba(91, 33, 182, 1)']
      : ['rgba(91, 33, 182, 0.95)', 'rgba(123, 58, 231, 1)'];
  };
  
  const getUserBackdropColors = () => {
    if (hasError) {
      return ['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.15)'];
    }
    return colorScheme === 'dark' 
      ? ['rgba(139, 92, 246, 0.25)', 'rgba(91, 33, 182, 0.35)']
      : ['rgba(91, 33, 182, 0.15)', 'rgba(123, 58, 231, 0.25)'];
  };
  
  const getAIBackgroundColors = () => {
    return colorScheme === 'dark'
      ? ['rgba(30, 27, 60, 0.95)', 'rgba(45, 27, 105, 0.9)']
      : ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)'];
  };
  
  const getAIBorderColor = () => {
    const typeData = getTypeIcon(message.type);
    return colorScheme === 'dark'
      ? typeData.gradient[0] + '30'
      : typeData.gradient[0] + '25';
  };
  
  const getAIGlowColor = () => {
    const typeData = getTypeIcon(message.type);
    return typeData.gradient[0] + '20';
  };
  
  const getSleepThemeAccent = (type?: string) => {
    switch (type) {
      case 'insight': return Colors.sleepStages.rem;
      case 'recommendation': return Colors.semantic.success;
      case 'question': return Colors.semantic.warning;
      default: return tintColor as string;
    }
  };

  const handlePress = () => {
    // Platform-specific haptic feedback optimization
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLongPress?.();
  };

  return (
    <Animated.View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer,
      {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    ]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {isUser ? (
          <View style={styles.userBubbleContainer}>
            {/* Simplified user bubble for better performance */}
            <LinearGradient
              colors={getUserGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.bubble,
                styles.userBubble,
                styles.userBubbleGradient,
                hasError && {
                  borderWidth: 2,
                  borderColor: errorColor + 'CC',
                }
              ]}
            >
              {renderBubbleContent()}
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.aiBubbleContainer}>
            {/* Optimized AI message with reduced visual complexity */}
            <LinearGradient
              colors={getAIBackgroundColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.bubble,
                styles.aiBubble,
                {
                  borderWidth: 1,
                  borderColor: getAIBorderColor(),
                  ...Platform.select({
                    ios: {
                      shadowColor: getAIGlowColor(),
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 3,
                    },
                  }),
                }
              ]}
            >
              {renderBubbleContent()}
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Enhanced retry button */}
      {hasError && onRetryPress && renderRetryButton()}
    </Animated.View>
  );

  function renderBubbleContent() {
    return (
      <>
        {/* Enhanced message type indicator with sleep theme */}
        {!isUser && message.type && message.type !== 'text' && (
          <View style={styles.typeIndicatorContainer}>
            <LinearGradient
              colors={getTypeIcon(message.type).bgGradient}
              style={styles.typeIndicator}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.typeContent}>
                <LinearGradient
                  colors={getTypeIcon(message.type).gradient}
                  style={styles.typeIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconSymbol
                    size={16}
                    color="white"
                    name={getTypeIcon(message.type).icon as any}
                  />
                </LinearGradient>
                <View style={styles.typeLabelContainer}>
                  <ThemedText 
                    type="caption" 
                    style={[
                      styles.typeLabel,
                      { color: getSleepThemeAccent(message.type) }
                    ]}
                  >
                    {getTypeIcon(message.type).label}
                  </ThemedText>
                  <View style={[
                    styles.typeDot,
                    { backgroundColor: getSleepThemeAccent(message.type) }
                  ]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        
        {/* Enhanced message text with sleep-focused typography */}
        <View style={styles.messageContent}>
          <ThemedText
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
              { 
                color: isUser 
                  ? (hasError ? 'rgba(255,255,255,0.95)' : '#FFFFFF') 
                  : textColor 
              },
              !isUser && message.type === 'recommendation' && styles.recommendationText,
              !isUser && message.type === 'insight' && styles.insightText,
              !isUser && message.type === 'question' && styles.questionText,
              hasError && styles.errorText,
            ]}
          >
            {formatMessageText(message.text)}
          </ThemedText>
          
          {/* Sleep-themed accent for AI messages */}
          {!isUser && message.type && message.type !== 'text' && (
            <View style={[
              styles.messageAccent,
              { backgroundColor: getSleepThemeAccent(message.type) + '20' }
            ]} />
          )}
        </View>

        {/* Enhanced status row */}
        <View style={styles.statusRow}>
          {/* Status indicator for user messages */}
          {isUser && (
            <View style={styles.statusIndicator}>
              {isSending && (
                <ActivityIndicator 
                  size="small" 
                  color={hasError ? errorColor : 'rgba(255,255,255,0.8)'} 
                  style={styles.loadingIndicator}
                />
              )}
              {hasError && (
                <View style={styles.errorIndicator}>
                  <IconSymbol
                    size={12}
                    color={errorColor}
                    name="exclamationmark.triangle.fill"
                  />
                </View>
              )}
              {message.status === 'sent' && !hasError && (
                <View style={styles.sentIndicator}>
                  <IconSymbol
                    size={12}
                    color="rgba(255,255,255,0.8)"
                    name="checkmark.circle.fill"
                  />
                </View>
              )}
            </View>
          )}
          
          {/* Enhanced timestamp */}
          <ThemedText
            type="caption"
            style={[
              styles.timestamp,
              { 
                color: isUser 
                  ? (hasError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255,255,255,0.8)') 
                  : mutedColor 
              }
            ]}
          >
            {formatTime(message.timestamp)}
            {hasError && message.retryCount && message.retryCount > 0 && (
              <ThemedText type="caption" style={{ color: errorColor }}>
                {` • Attempt ${(message.retryCount || 0) + 1}`}
              </ThemedText>
            )}
          </ThemedText>
        </View>
      </>
    );
  }

  function renderRetryButton() {
    return (
      <TouchableOpacity
        style={[
          styles.retryButton,
          isUser ? styles.retryButtonUser : styles.retryButtonAI,
          { backgroundColor: errorColor + '15', borderColor: errorColor + '30' }
        ]}
        onPress={() => {
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onRetryPress?.();
        }}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel="Retry sending message"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[errorColor + '20', errorColor + '10']}
          style={styles.retryButtonGradient}
        >
          <IconSymbol
            size={16}
            color={errorColor}
            name="arrow.clockwise"
          />
          <ThemedText style={[styles.retryText, { color: errorColor }]}>
            Retry
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
});

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    maxWidth: screenWidth * 0.85,
    minWidth: screenWidth * 0.2,
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  touchable: {
    width: '100%',
  },
  // Optimized user bubble styles
  userBubbleContainer: {
    position: 'relative',
  },
  bubble: {
    padding: 18,
    minWidth: 80,
    borderRadius: 24,
  },
  userBubble: {
    borderTopRightRadius: 10,
  },
  userBubbleGradient: {
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  // Enhanced AI bubble styles
  aiBubbleContainer: {
    position: 'relative',
  },
  aiBubble: {
    borderTopLeftRadius: 10,
    backgroundColor: 'transparent',
  },
  // Removed aiGlow for performance optimization
  // Enhanced type indicator styles
  typeIndicatorContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  typeIndicator: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabelContainer: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  typeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 6,
    opacity: 0.6,
  },
  // Enhanced message content styles
  messageContent: {
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  userMessageText: {
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  aiMessageText: {
    fontWeight: '450',
    lineHeight: 25,
  },
  recommendationText: {
    lineHeight: 26,
    fontSize: 15.5,
    fontWeight: '500',
  },
  insightText: {
    lineHeight: 25,
    fontSize: 15.5,
    fontWeight: '475',
  },
  questionText: {
    lineHeight: 25,
    fontSize: 15.5,
    fontWeight: '475',
  },
  errorText: {
    opacity: 0.9,
  },
  messageAccent: {
    position: 'absolute',
    left: -6,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 1.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    marginRight: 6,
  },
  sentIndicator: {
    opacity: 0.8,
  },
  errorIndicator: {
    opacity: 1,
  },
  loadingIndicator: {
    width: 12,
    height: 12,
  },
  timestamp: {
    fontSize: 11,
    flexShrink: 0,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  retryButtonUser: {
    alignSelf: 'flex-end',
  },
  retryButtonAI: {
    alignSelf: 'flex-start',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
});