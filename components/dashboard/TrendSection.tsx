import React, { memo, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MiniChart } from '@/components/ui/MiniChart';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { SleepData } from '@/lib/services/sleepService';

interface TrendSectionProps {
  sleepData: SleepData;
  delay?: number;
}

const TrendSection = memo(({ sleepData, delay = 600 }: TrendSectionProps) => {
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // Generate sample trend data based on current sleep score
    const baseScore = sleepData.score;
    const variance = 15;
    
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * variance)),
    }));
  }, [sleepData.score]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/analytics?tab=trends');
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable onPress={handlePress}>
        <ThemedView
          style={{
            backgroundColor: cardBg,
            borderRadius: 24,
            padding: 24,
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16 
          }}>
            <ThemedText type="subtitle">7-Day Trend</ThemedText>
            <ThemedText 
              style={{ 
                color: primaryColor,
                fontSize: 14,
                fontWeight: '600'
              }}
            >
              View Details →
            </ThemedText>
          </View>
          
          <MiniChart
            data={chartData}
            height={60}
            strokeWidth={2}
            color={primaryColor}
            showDots={false}
            animated={true}
          />
          
          <ThemedText 
            style={{ 
              fontSize: 12,
              marginTop: 12,
              opacity: 0.7 
            }}
          >
            Your sleep quality has been improving this week
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
});

TrendSection.displayName = 'TrendSection';

export default TrendSection;