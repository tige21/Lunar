import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { QuickSuggestions, type QuickSuggestion } from '@/components/ui/QuickSuggestions';
import { SmartReplies } from '@/components/ui/SmartReplies';

interface QuickActionsProps {
  onSuggestionPress: (suggestion: string) => void;
  onSmartReplyPress: (reply: string) => void;
  lastMessage?: string;
  isVisible?: boolean;
  delay?: number;
}

const QuickActions = memo(({ 
  onSuggestionPress, 
  onSmartReplyPress, 
  lastMessage,
  isVisible = true,
  delay = 0
}: QuickActionsProps) => {
  // Memoize sleep-related quick suggestions
  const quickSuggestions: QuickSuggestion[] = useMemo(() => [
    {
      id: '1',
      text: "How did I sleep last night?",
      category: 'analysis',
      icon: '💤'
    },
    {
      id: '2', 
      text: "Tips for better sleep",
      category: 'advice',
      icon: '💡'
    },
    {
      id: '3',
      text: "What's my sleep trend?",
      category: 'trends',
      icon: '📈'
    },
    {
      id: '4',
      text: "Sleep schedule recommendations",
      category: 'schedule',
      icon: '⏰'
    },
    {
      id: '5',
      text: "Why am I waking up tired?",
      category: 'problems',
      icon: '😴'
    },
    {
      id: '6',
      text: "Sleep environment tips",
      category: 'environment',
      icon: '🛏️'
    }
  ], []);

  // Memoize smart replies based on last message
  const smartReplies = useMemo(() => {
    if (!lastMessage) return [];

    const message = lastMessage.toLowerCase();
    
    if (message.includes('sleep') || message.includes('tired')) {
      return [
        "Tell me more",
        "What can I improve?", 
        "Show me trends",
        "Any recommendations?"
      ];
    }
    
    if (message.includes('recommend') || message.includes('suggest')) {
      return [
        "That sounds helpful",
        "How do I start?",
        "More details please",
        "Thanks!"
      ];
    }

    return [
      "Interesting",
      "Tell me more",
      "What else?",
      "Thanks"
    ];
  }, [lastMessage]);

  if (!isVisible) return null;

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={styles.container}
    >
      {/* Smart Replies - shown if there's a recent AI message */}
      {smartReplies.length > 0 && lastMessage && (
        <View style={styles.section}>
          <SmartReplies
            replies={smartReplies}
            onReplyPress={onSmartReplyPress}
            maxVisible={4}
          />
        </View>
      )}

      {/* Quick Suggestions - always available */}
      <View style={styles.section}>
        <QuickSuggestions
          suggestions={quickSuggestions}
          onSuggestionPress={onSuggestionPress}
          maxVisible={6}
          showCategories={false}
        />
      </View>
    </Animated.View>
  );
});

QuickActions.displayName = 'QuickActions';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  section: {
    marginVertical: 4,
  },
});

export default QuickActions;