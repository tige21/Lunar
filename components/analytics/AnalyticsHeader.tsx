import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AnalyticsHeaderProps {
  onExportPress: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  delay?: number;
}

const AnalyticsHeader = memo(({ 
  onExportPress, 
  onRefresh, 
  isRefreshing,
  delay = 0 
}: AnalyticsHeaderProps) => {
  const primaryColor = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({ light: '#666666', dark: '#AAAAAA' }, 'text');

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <ThemedView style={styles.container}>
        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            Sleep Analytics 📊
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
            Deep insights into your sleep patterns
          </ThemedText>
        </View>
        
        <View style={styles.actionContainer}>
          <Pressable
            style={[styles.actionButton, { opacity: isRefreshing ? 0.6 : 1 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRefresh();
            }}
            disabled={isRefreshing}
          >
            <IconSymbol 
              name="arrow.clockwise" 
              size={20} 
              color={primaryColor}
            />
          </Pressable>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onExportPress();
            }}
          >
            <IconSymbol 
              name="square.and.arrow.up" 
              size={20} 
              color={primaryColor}
            />
          </Pressable>
        </View>
      </ThemedView>
    </Animated.View>
  );
});

AnalyticsHeader.displayName = 'AnalyticsHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnalyticsHeader;