import { CaptionText, ThemedText } from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { HealthPermissions } from '@/lib/services/healthKitService';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PermissionsScreenMessages } from './types';

interface PermissionsStatusProps {
  messages: PermissionsScreenMessages;
  permissions: HealthPermissions | null;
}

export const PermissionsStatus: React.FC<PermissionsStatusProps> = ({ messages, permissions }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  if (!permissions) return null;

  const PermissionStatusItem = ({
    icon,
    title,
    granted
  }: {
    icon: string;
    title: string;
    granted: boolean;
  }) => (
    <View style={[styles.statusItem, { backgroundColor: surfaceColor }]}>
      <IconSymbol
        name={icon as any}
        size={16}
        color={granted ? Colors.semantic.success : textColor}
      />
      <CaptionText style={[
        styles.statusItemText,
        { color: granted ? Colors.semantic.success : textColor }
      ]}>
        {title}
      </CaptionText>
      <IconSymbol
        name={granted ? "checkmark.circle.fill" : "xmark.circle.fill"}
        size={14}
        color={granted ? Colors.semantic.success : Colors.semantic.error}
      />
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.delay(400).duration(600)}
      style={styles.statusSection}
    >
      <ThemedText type="defaultSemiBold" style={styles.statusTitle}>
        {messages.permissions.statusTitle}
      </ThemedText>

      <View style={styles.statusGrid}>
        <PermissionStatusItem
          icon="moon.stars.fill"
          title={messages.permissions.types.sleep}
          granted={permissions.sleep}
        />
        <PermissionStatusItem
          icon="heart.fill"
          title={messages.permissions.types.heartRate}
          granted={permissions.heartRate}
        />
        <PermissionStatusItem
          icon="figure.walk"
          title={messages.permissions.types.steps}
          granted={permissions.steps}
        />
        <PermissionStatusItem
          icon="flame.fill"
          title={messages.permissions.types.workout}
          granted={permissions.workout}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statusSection: {
    marginBottom: DesignTokens.spacing.xl,
  },
  statusTitle: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  statusGrid: {
    gap: DesignTokens.spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing.sm,
  },
  statusItemText: {
    flex: 1,
    fontSize: DesignTokens.fontSize.sm,
  },
});