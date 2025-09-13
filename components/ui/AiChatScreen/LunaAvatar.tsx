import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LunaAvatarProps } from './types';

const LunaAvatar = React.memo<LunaAvatarProps>(({ colorScheme }) => {
  return (
    <ThemedView style={styles.lunaContainer}>
      <ThemedView style={styles.lunaAvatar}>
        <LinearGradient
          colors={[
            colorScheme === 'dark' ? '#8B5CF6' : '#5B21B6',
            colorScheme === 'dark' ? '#A78BFA' : '#7C3AED',
          ]}
          style={styles.avatarGradient}
        >
          <IconSymbol
            size={32}
            color="white"
            name="moon.stars.fill"
          />
        </LinearGradient>
      </ThemedView>
    </ThemedView>
  );
});

LunaAvatar.displayName = 'LunaAvatar';

const styles = StyleSheet.create({
  lunaContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  lunaAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LunaAvatar;