import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'insight' | 'recommendation' | 'question';
  status?: 'sending' | 'sent' | 'error';
}

interface MessageBubbleProps {
  message: ChatMessage;
  onLongPress?: () => void;
}

const MessageBubble = memo(({ message, onLongPress }: MessageBubbleProps) => {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint') as string;
  const textColor = useThemeColor({}, 'text') as string;
  const { isUser, status, type } = message;
  const hasError = status === 'error';
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Enhanced message type styling
  const getMessageTypeTheme = (type?: string) => {
    switch (type) {
      case 'insight':
        return {
          colors: colorScheme === 'dark' 
            ? ['#1E1B3C', '#2D1B69', '#8B5CF6']
            : ['#F8FAFC', '#EDE9FE', '#8B5CF6'],
          borderColor: '#8B5CF6' + '40',
          icon: 'lightbulb.fill',
          accentColor: '#8B5CF6',
        };
      case 'recommendation':
        return {
          colors: colorScheme === 'dark' 
            ? ['#0F2A1A', '#1B3D2A', '#10B981']
            : ['#F0FDF4', '#DCFCE7', '#10B981'],
          borderColor: '#10B981' + '40',
          icon: 'star.fill',
          accentColor: '#10B981',
        };
      case 'question':
        return {
          colors: colorScheme === 'dark' 
            ? ['#1E2A3A', '#2A4A6B', '#3B82F6']
            : ['#F0F9FF', '#DBEAFE', '#3B82F6'],
          borderColor: '#3B82F6' + '40',
          icon: 'questionmark.circle.fill',
          accentColor: '#3B82F6',
        };
      default:
        return {
          colors: colorScheme === 'dark' 
            ? ['#1E1B3C', '#2D1B69']
            : ['#F8FAFC', '#EDE9FE'],
          borderColor: tintColor + '20',
          icon: 'message.fill',
          accentColor: tintColor,
        };
    }
  };

  const getUserColors = () => {
    if (hasError) {
      return ['#EF4444', '#DC2626'];
    }
    return colorScheme === 'dark'
      ? [tintColor + 'E6', tintColor + 'CC']
      : [tintColor, tintColor + 'E6'];
  };

  const theme = isUser ? { colors: getUserColors() } : getMessageTypeTheme(type);
  
  // Enhanced press animations for mobile
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  const formatMessageText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/• /g, '• ')
      .trim();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return 'clock.fill';
      case 'sent':
        return 'checkmark.circle.fill';
      case 'error':
        return 'exclamationmark.triangle.fill';
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';
      case 'sent':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return textColor;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={theme.colors}
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
            {
              borderColor: theme.borderColor || (theme.colors[0] + '30'),
              maxWidth: SCREEN_WIDTH * 0.8,
              minWidth: 120,
              ...Platform.select({
                ios: {
                  shadowColor: isUser ? tintColor : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isUser ? 0.3 : 0.1,
                  shadowRadius: isUser ? 8 : 4,
                },
                android: {
                  elevation: isUser ? 6 : 3,
                },
              }),
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Message type indicator for AI messages */}
          {!isUser && type && type !== 'text' && (
            <View style={styles.typeIndicator}>
              <LinearGradient
                colors={[theme.accentColor + '20', theme.accentColor + '40']}
                style={styles.typeIconContainer}
              >
                <IconSymbol
                  size={14}
                  color={theme.accentColor}
                  name={theme.icon as any}
                />
              </LinearGradient>
              <ThemedText 
                type="caption" 
                style={[
                  styles.typeText,
                  { color: theme.accentColor }
                ]}
              >
                {type.toUpperCase()}
              </ThemedText>
            </View>
          )}

          {/* Message content */}
          <ThemedText
            style={[
              styles.messageText,
              {
                color: isUser ? '#FFFFFF' : textColor,
                fontSize: Platform.OS === 'ios' ? 16 : 15,
                lineHeight: Platform.OS === 'ios' ? 24 : 22,
              }
            ]}
            selectable={true}
          >
            {formatMessageText(message.text)}
          </ThemedText>

          {/* Enhanced timestamp and status for user messages */}
          {isUser && (
            <View style={styles.statusContainer}>
              <ThemedText
                type="caption"
                style={[
                  styles.timestamp,
                  { color: '#FFFFFF' + 'CC' }
                ]}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </ThemedText>
              {getStatusIcon() && (
                <IconSymbol
                  size={12}
                  color={getStatusColor()}
                  name={getStatusIcon() as any}
                  style={styles.statusIcon}
                />
              )}
            </View>
          )}

          {/* AI message timestamp */}
          {!isUser && (
            <ThemedText
              type="caption"
              style={[
                styles.aiTimestamp,
                { color: textColor + '70' }
              ]}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          )}
        </LinearGradient>

        {/* Message tail for better visual hierarchy */}
        <View style={[
          styles.messageTail,
          isUser ? styles.userTail : styles.aiTail,
          {
            borderTopColor: theme.colors[theme.colors.length > 1 ? 1 : 0],
          }
        ]} />
      </TouchableOpacity>
    </Animated.View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  touchable: {
    position: 'relative',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: Platform.OS === 'ios' ? 44 : 48,
    justifyContent: 'center',
  },
  userBubble: {
    borderTopRightRadius: 8,
    marginLeft: 60,
  },
  aiBubble: {
    borderTopLeftRadius: 8,
    marginRight: 60,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  messageText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    paddingTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 6,
    opacity: 0.8,
  },
  statusIcon: {
    opacity: 0.9,
  },
  aiTimestamp: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.6,
  },
  messageTail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  userTail: {
    right: 12,
    bottom: 0,
  },
  aiTail: {
    left: 12,
    bottom: 0,
  },
});

export default MessageBubble;