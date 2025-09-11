import React, { useState, useEffect, memo } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

export interface MessageReaction {
  id: string;
  type: 'helpful' | 'love' | 'insight' | 'concern' | 'question' | 'thumbs_up';
  count: number;
  userReacted: boolean;
  emoji: string;
  label: string;
  gradient: string[];
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onReactionPress: (reactionType: MessageReaction['type']) => void;
  onReactionLongPress?: (reaction: MessageReaction) => void;
  isVisible?: boolean;
}

const SLEEP_REACTIONS: Omit<MessageReaction, 'id' | 'count' | 'userReacted'>[] = [
  {
    type: 'helpful',
    emoji: '💡',
    label: 'Helpful',
    gradient: ['#10B981', '#059669'],
  },
  {
    type: 'love',
    emoji: '❤️',
    label: 'Love it',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    type: 'insight',
    emoji: '🧠',
    label: 'Great insight',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    type: 'concern',
    emoji: '😟',
    label: 'Concerning',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    type: 'question',
    emoji: '❓',
    label: 'Have questions',
    gradient: ['#3B82F6', '#2563EB'],
  },
  {
    type: 'thumbs_up',
    emoji: '👍',
    label: 'Good advice',
    gradient: ['#06B6D4', '#0891B2'],
  },
];

export const MessageReactions = memo(function MessageReactions({
  messageId,
  reactions,
  onReactionPress,
  onReactionLongPress,
  isVisible = true,
}: MessageReactionsProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [animatedValues] = useState(() => new Map<string, Animated.Value>());

  // Initialize animations for reactions
  useEffect(() => {
    reactions.forEach((reaction) => {
      if (!animatedValues.has(reaction.id)) {
        animatedValues.set(reaction.id, new Animated.Value(reaction.userReacted ? 1 : 0.95));
      }
    });
  }, [reactions, animatedValues]);

  const handleReactionPress = (reactionType: MessageReaction['type']) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate reaction feedback
    reactions.forEach((reaction) => {
      if (reaction.type === reactionType) {
        const animValue = animatedValues.get(reaction.id);
        if (animValue) {
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: reaction.userReacted ? 0.95 : 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    });

    onReactionPress(reactionType);
  };

  const handleAddReaction = () => {
    setShowAllReactions(!showAllReactions);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const getReactionBackground = (reaction: MessageReaction) => {
    if (reaction.userReacted) {
      return reaction.gradient;
    }
    return colorScheme === 'dark'
      ? ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.6)']
      : ['rgba(249, 250, 251, 0.9)', 'rgba(243, 244, 246, 0.8)'];
  };

  const getReactionTextColor = (reaction: MessageReaction) => {
    if (reaction.userReacted) {
      return '#FFFFFF';
    }
    return colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  };

  const renderReaction = ({ item: reaction }: { item: MessageReaction }) => {
    const animValue = animatedValues.get(reaction.id) || new Animated.Value(0.95);

    return (
      <Animated.View
        style={[
          styles.reactionContainer,
          {
            transform: [{ scale: animValue }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleReactionPress(reaction.type)}
          onLongPress={() => onReactionLongPress?.(reaction)}
          activeOpacity={0.8}
          style={styles.reactionTouchable}
        >
          <LinearGradient
            colors={getReactionBackground(reaction)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.reactionBubble,
              reaction.userReacted && styles.reactedBubble,
              {
                borderColor: reaction.userReacted
                  ? reaction.gradient[0]
                  : colorScheme === 'dark'
                  ? 'rgba(75, 85, 99, 0.5)'
                  : 'rgba(209, 213, 219, 0.5)',
              },
            ]}
          >
            <ThemedText style={[styles.reactionEmoji]}>
              {reaction.emoji}
            </ThemedText>
            <ThemedText
              style={[
                styles.reactionCount,
                { color: getReactionTextColor(reaction) },
              ]}
            >
              {reaction.count}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderAddReactionButton = () => (
    <TouchableOpacity
      onPress={handleAddReaction}
      activeOpacity={0.8}
      style={styles.addReactionContainer}
    >
      <LinearGradient
        colors={
          colorScheme === 'dark'
            ? ['rgba(55, 65, 81, 0.8)', 'rgba(75, 85, 99, 0.6)']
            : ['rgba(249, 250, 251, 0.9)', 'rgba(243, 244, 246, 0.8)']
        }
        style={[
          styles.addReactionBubble,
          {
            borderColor: colorScheme === 'dark'
              ? 'rgba(75, 85, 99, 0.5)'
              : 'rgba(209, 213, 219, 0.5)',
          },
        ]}
      >
        <IconSymbol
          name={showAllReactions ? 'xmark' : 'plus'}
          size={14}
          color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickReactions = () => (
    <View style={styles.quickReactionsContainer}>
      <FlatList
        data={reactions.filter(r => r.count > 0)}
        renderItem={renderReaction}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.reactionsList}
        contentContainerStyle={styles.reactionsContent}
      />
      {renderAddReactionButton()}
    </View>
  );

  const renderAllReactions = () => (
    <View style={styles.allReactionsContainer}>
      <ThemedText style={styles.reactionsTitle}>
        Add a reaction
      </ThemedText>
      <FlatList
        data={SLEEP_REACTIONS}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              handleReactionPress(item.type);
              setShowAllReactions(false);
            }}
            activeOpacity={0.8}
            style={styles.allReactionItem}
          >
            <LinearGradient
              colors={item.gradient}
              style={styles.allReactionIcon}
            >
              <ThemedText style={styles.allReactionEmoji}>
                {item.emoji}
              </ThemedText>
            </LinearGradient>
            <ThemedText style={styles.allReactionLabel}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.type}
        numColumns={3}
        style={styles.allReactionsList}
        contentContainerStyle={styles.allReactionsContent}
      />
    </View>
  );

  if (!isVisible) return null;

  return (
    <ThemedView style={styles.container}>
      {showAllReactions ? renderAllReactions() : renderQuickReactions()}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  quickReactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionsList: {
    flex: 1,
  },
  reactionsContent: {
    paddingRight: 8,
  },
  reactionContainer: {
    marginRight: 8,
  },
  reactionTouchable: {
    borderRadius: 16,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 48,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reactedBubble: {
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(139, 92, 246, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  addReactionContainer: {
    marginLeft: 4,
  },
  addReactionBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  allReactionsContainer: {
    backgroundColor: 'transparent',
  },
  reactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  allReactionsList: {
    maxHeight: 200,
  },
  allReactionsContent: {
    paddingBottom: 8,
  },
  allReactionItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    margin: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  allReactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  allReactionEmoji: {
    fontSize: 18,
  },
  allReactionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});