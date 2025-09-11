import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export interface QuickSuggestion {
  id: string;
  text: string;
  icon: string;
  category?: 'analysis' | 'improvement' | 'routine' | 'troubleshooting';
}

interface QuickSuggestionsProps {
  suggestions: QuickSuggestion[];
  onSuggestionPress: (suggestion: QuickSuggestion) => void;
  isVisible?: boolean;
}

const DEFAULT_SUGGESTIONS: QuickSuggestion[] = [
  { 
    id: '1', 
    text: 'How did I sleep last night?', 
    icon: 'moon.fill',
    category: 'analysis'
  },
  { 
    id: '2', 
    text: 'What can improve my sleep?', 
    icon: 'star.fill',
    category: 'improvement'
  },
  { 
    id: '3', 
    text: 'Analyze my sleep trends', 
    icon: 'chart.bar.fill',
    category: 'analysis'
  },
  { 
    id: '4', 
    text: 'Best bedtime for me?', 
    icon: 'timer',
    category: 'routine'
  },
  { 
    id: '5', 
    text: 'I can\'t fall asleep', 
    icon: 'exclamationmark.triangle.fill',
    category: 'troubleshooting'
  },
  { 
    id: '6', 
    text: 'Sleep environment tips', 
    icon: 'house.fill',
    category: 'improvement'
  },
];

export function QuickSuggestions({ 
  suggestions = DEFAULT_SUGGESTIONS, 
  onSuggestionPress,
  isVisible = true 
}: QuickSuggestionsProps) {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint') as string;
  const textColor = useThemeColor({}, 'text') as string;
  const surfaceColor = useThemeColor({}, 'surface') as string;

  if (!isVisible) return null;

  const getCategoryTheme = (category?: string) => {
    switch (category) {
      case 'analysis':
        return {
          colors: [Colors.sleepStages.rem, Colors.sleepStages.deep],
          icon: 'chart.line.uptrend.xyaxis',
          accent: Colors.sleepStages.rem,
        };
      case 'improvement':
        return {
          colors: [Colors.semantic.success, '#059669'],
          icon: 'star.fill',
          accent: Colors.semantic.success,
        };
      case 'routine':
        return {
          colors: [Colors.semantic.warning, '#D97706'],
          icon: 'timer',
          accent: Colors.semantic.warning,
        };
      case 'troubleshooting':
        return {
          colors: [Colors.semantic.error, '#DC2626'],
          icon: 'exclamationmark.triangle.fill',
          accent: Colors.semantic.error,
        };
      default:
        return {
          colors: [tintColor, tintColor + 'CC'],
          icon: 'message.fill',
          accent: tintColor,
        };
    }
  };
  
  const handleSuggestionPress = (suggestion: QuickSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSuggestionPress(suggestion);
  };

  return (
    <ThemedView 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Quick question suggestions"
      accessibilityRole="region"
    >
      {/* Enhanced header with sleep theme */}
      <ThemedView style={styles.header}>
        <ThemedView style={[
          styles.headerIcon,
          { backgroundColor: tintColor + '20' }
        ]}>
          <IconSymbol
            size={14}
            color={tintColor}
            name="lightbulb.fill"
          />
        </ThemedView>
        <ThemedText 
          type="caption" 
          style={[
            styles.title,
            { color: textColor, fontWeight: '600' }
          ]}
        >
          QUICK QUESTIONS
        </ThemedText>
      </ThemedView>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={160}
      >
        {suggestions.map((suggestion, index) => {
          const theme = getCategoryTheme(suggestion.category);
          return (
            <TouchableOpacity
              key={suggestion.id}
              style={styles.suggestionCard}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.85}
              accessible={true}
              accessibilityLabel={`Ask: ${suggestion.text}`}
              accessibilityRole="button"
              accessibilityHint={`Category: ${suggestion.category || 'general'}`}
            >
              <LinearGradient
                colors={[
                  colorScheme === 'dark' 
                    ? 'rgba(30, 27, 60, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                  colorScheme === 'dark' 
                    ? 'rgba(45, 27, 105, 0.9)'
                    : 'rgba(248, 250, 252, 0.9)'
                ]}
                style={[
                  styles.cardGradient,
                  {
                    borderWidth: 1.5,
                    borderColor: theme.accent + '25',
                    ...DesignTokens.shadows.soft,
                  }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Category accent bar */}
                <LinearGradient
                  colors={theme.colors}
                  style={styles.categoryAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                
                {/* Enhanced icon container */}
                <LinearGradient
                  colors={[theme.accent + '20', theme.accent + '10']}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <LinearGradient
                    colors={theme.colors}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconSymbol
                      size={22}
                      color="white"
                      name={suggestion.icon as any}
                    />
                  </LinearGradient>
                </LinearGradient>
                
                <ThemedText 
                  style={[
                    styles.suggestionText,
                    { color: textColor }
                  ]}
                  numberOfLines={3}
                >
                  {suggestion.text}
                </ThemedText>
                
                {suggestion.category && (
                  <ThemedText 
                    type="caption" 
                    style={[
                      styles.categoryText,
                      { color: theme.accent }
                    ]}
                  >
                    {suggestion.category.toUpperCase()}
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Enhanced vertical layout for better mobile experience */}
      <ThemedView style={styles.verticalContainer}>
        {suggestions.slice(0, 3).map((suggestion) => {
          const theme = getCategoryTheme(suggestion.category);
          return (
            <TouchableOpacity
              key={suggestion.id + '_vertical'}
              style={styles.verticalSuggestion}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={`Ask: ${suggestion.text}`}
              accessibilityRole="button"
              accessibilityHint={`Category: ${suggestion.category || 'general'}`}
            >
              <LinearGradient
                colors={[
                  colorScheme === 'dark' 
                    ? 'rgba(45, 27, 105, 0.8)'
                    : 'rgba(255, 255, 255, 0.9)',
                  colorScheme === 'dark' 
                    ? 'rgba(30, 27, 60, 0.9)'
                    : 'rgba(248, 250, 252, 0.8)'
                ]}
                style={[
                  styles.verticalCardGradient,
                  {
                    borderColor: theme.accent + '30',
                    ...DesignTokens.shadows.soft,
                  }
                ]}
              >
                <ThemedView style={[
                  styles.verticalIcon,
                  { backgroundColor: theme.accent + '20' }
                ]}>
                  <IconSymbol
                    size={18}
                    color={theme.accent}
                    name={suggestion.icon as any}
                  />
                </ThemedView>
                <ThemedText 
                  style={[
                    styles.verticalSuggestionText,
                    { color: textColor }
                  ]}
                  numberOfLines={2}
                >
                  {suggestion.text}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingRight: 20,
  },
  suggestionCard: {
    width: 150,
    marginRight: 16,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 140,
    position: 'relative',
  },
  categoryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Enhanced vertical layout
  verticalContainer: {
    marginTop: 16,
    display: screenWidth < 380 ? 'flex' : 'none',
  },
  verticalSuggestion: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  verticalCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  verticalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalSuggestionText: {
    marginLeft: 16,
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
  },
});