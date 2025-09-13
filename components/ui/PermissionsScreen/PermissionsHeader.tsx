import { BodyText, TitleText } from '@/components/ui';
import { DesignTokens } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PermissionsScreenMessages } from './types';

interface PermissionsHeaderProps {
  messages: PermissionsScreenMessages;
}

export const PermissionsHeader: React.FC<PermissionsHeaderProps> = ({ messages }) => {
  return (
    <View style={styles.header}>
      <TitleText style={styles.title}>
        {messages.header.title}
      </TitleText>
      <BodyText style={styles.subtitle}>
        {messages.header.subtitle}
      </BodyText>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '90%',
  },
});