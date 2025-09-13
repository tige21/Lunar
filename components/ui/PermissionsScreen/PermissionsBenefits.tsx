import { CaptionText, ThemedText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PermissionsScreenMessages } from './types';

interface PermissionsBenefitsProps {
  messages: PermissionsScreenMessages;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PermissionsBenefits: React.FC<PermissionsBenefitsProps> = ({ messages }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');

  const BenefitPreview = ({
    icon,
    title,
    description
  }: {
    icon: string;
    title: string;
    description: string;
  }) => (
    <View style={[styles.benefitPreviewCard, { backgroundColor: surfaceColor }]}>
      <IconSymbol
        name={icon as any}
        size={20}
        color={tintColor}
        style={styles.benefitPreviewIcon}
      />
      <ThemedText type="defaultSemiBold" style={styles.benefitPreviewTitle}>
        {title}
      </ThemedText>
      <CaptionText style={styles.benefitPreviewDescription}>
        {description}
      </CaptionText>
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.delay(600).duration(600)}
      style={styles.benefitsPreview}
    >
      <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
        {messages.benefits.title}
      </ThemedText>
      <View style={styles.previewGrid}>
        <BenefitPreview
          icon="chart.line.uptrend.xyaxis"
          title={messages.benefits.smartInsights.title}
          description={messages.benefits.smartInsights.description}
        />
        <BenefitPreview
          icon="moon.zzz.fill"
          title={messages.benefits.autoTracking.title}
          description={messages.benefits.autoTracking.description}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  benefitsPreview: {
    marginBottom: DesignTokens.spacing.xl,
  },
  previewTitle: {
    marginBottom: DesignTokens.spacing.lg,
    textAlign: 'center',
    fontSize: DesignTokens.fontSize.lg,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    justifyContent: 'space-between',
  },
  benefitPreviewCard: {
    width: (SCREEN_WIDTH - DesignTokens.spacing.lg * 2 - DesignTokens.spacing.md) / 2,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
    ...DesignTokens.shadows.soft,
  },
  benefitPreviewIcon: {
    marginBottom: DesignTokens.spacing.sm,
  },
  benefitPreviewTitle: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: DesignTokens.fontSize.sm,
  },
  benefitPreviewDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: DesignTokens.fontSize.xs,
  },
});