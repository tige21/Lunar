import { CaptionText, ThemedText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PermissionsScreenMessages } from './types';

interface PermissionsPrivacyProps {
  messages: PermissionsScreenMessages;
}

export const PermissionsPrivacy: React.FC<PermissionsPrivacyProps> = ({ messages }) => {
  const tintColor = useThemeColor({}, 'tint');

  const PrivacyPoint = ({ text }: { text: string }) => (
    <View style={styles.privacyPoint}>
      <IconSymbol
        name="checkmark.circle.fill"
        size={12}
        color={tintColor}
      />
      <CaptionText style={styles.privacyPointText}>{text}</CaptionText>
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(600)}
      style={styles.privacySection}
    >
      <LinearGradient
        colors={['rgba(91, 33, 182, 0.1)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.privacyCard}
      >
        <View style={styles.privacyHeader}>
          <IconSymbol
            name="lock.shield.fill"
            size={20}
            color={tintColor}
          />
          <ThemedText type="defaultSemiBold" style={styles.privacyTitle}>
            {messages.privacy.title}
          </ThemedText>
        </View>

        <View style={styles.privacyPoints}>
          <PrivacyPoint text={messages.privacy.points.localData} />
          <PrivacyPoint text={messages.privacy.points.noCloud} />
          <PrivacyPoint text={messages.privacy.points.userControl} />
          <PrivacyPoint text={messages.privacy.points.revokable} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  privacySection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  privacyCard: {
    padding: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.sm,
  },
  privacyTitle: {
    color: Colors.light.tint,
  },
  privacyPoints: {
    gap: DesignTokens.spacing.sm,
  },
  privacyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  privacyPointText: {
    opacity: 0.8,
  },
});