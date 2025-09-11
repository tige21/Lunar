import React, { memo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SleepScoreCardProps {
  score: number;
  quality: string;
  delay?: number;
}

const SleepScoreCard = memo(({ score, quality, delay = 200 }: SleepScoreCardProps) => {
  const primaryColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/analytics?tab=sleep-score');
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={[cardBg, cardBg + '95']}
          style={{
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <ThemedView style={{ backgroundColor: 'transparent' }}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Sleep Score
            </ThemedText>
            
            <CircularProgress
              value={score}
              size={120}
              strokeWidth={12}
              color={primaryColor}
              showValue={true}
            />
            
            <ThemedText 
              style={{ 
                textAlign: 'center',
                marginTop: 16,
                fontSize: 18,
                fontWeight: '600',
                color: primaryColor
              }}
            >
              {quality}
            </ThemedText>
          </ThemedView>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

SleepScoreCard.displayName = 'SleepScoreCard';

export default SleepScoreCard;