import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { ThemedButton } from '../ThemedButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  variant?: 'default' | 'sleep' | 'gradient';
  illustration?: 'sleep' | 'data' | 'permissions' | 'error';
};

export function EmptyState({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  variant = 'default',
  illustration = 'sleep',
}: EmptyStateProps) {
  const renderIllustration = () => {
    if (icon) return icon;

    const getIllustrationIcon = () => {
      switch (illustration) {
        case 'sleep':
          return '🌙';
        case 'data':
          return '📊';
        case 'permissions':
          return '🔒';
        case 'error':
          return '⚠️';
        default:
          return '🌙';
      }
    };

    return (
      <ThemedView style={styles.iconContainer}>
        <ThemedText style={styles.illustrationIcon}>
          {getIllustrationIcon()}
        </ThemedText>
      </ThemedView>
    );
  };

  const renderContent = () => (
    <ThemedView style={styles.content}>
      {renderIllustration()}
      
      <ThemedText type="heading" style={styles.title}>
        {title}
      </ThemedText>
      
      {description && (
        <ThemedText type="body" style={styles.description}>
          {description}
        </ThemedText>
      )}
      
      {actionTitle && onAction && (
        <ThemedButton
          title={actionTitle}
          variant="primary"
          onPress={onAction}
          style={styles.actionButton}
        />
      )}
    </ThemedView>
  );

  if (variant === 'gradient') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.gradientContainer}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(91, 33, 182, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.gradient]}
          />
          {renderContent()}
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {renderContent()}
    </ThemedView>
  );
}

// Predefined empty states for common scenarios
export function SleepDataEmptyState({
  onSetupSleep,
}: {
  onSetupSleep?: () => void;
}) {
  return (
    <EmptyState
      title="No Sleep Data Yet"
      description="Start tracking your sleep to see insights about your rest patterns and improve your sleep quality."
      illustration="sleep"
      actionTitle="Setup Sleep Tracking"
      onAction={onSetupSleep}
      variant="gradient"
    />
  );
}

export function PermissionsEmptyState({
  onRequestPermissions,
}: {
  onRequestPermissions?: () => void;
}) {
  return (
    <EmptyState
      title="Permissions Required"
      description="To track your sleep automatically, we need access to your health data and motion sensors."
      illustration="permissions"
      actionTitle="Grant Permissions"
      onAction={onRequestPermissions}
      variant="default"
    />
  );
}

export function HistoryEmptyState({
  onStartTracking,
}: {
  onStartTracking?: () => void;
}) {
  return (
    <EmptyState
      title="No Sleep History"
      description="Your sleep history will appear here once you start tracking. Get insights into your sleep patterns over time."
      illustration="data"
      actionTitle="Start Tracking Tonight"
      onAction={onStartTracking}
      variant="sleep"
    />
  );
}

export function ErrorEmptyState({
  onRetry,
  errorMessage,
}: {
  onRetry?: () => void;
  errorMessage?: string;
}) {
  return (
    <EmptyState
      title="Something Went Wrong"
      description={errorMessage || "We couldn't load your sleep data. Please try again or check your connection."}
      illustration="error"
      actionTitle="Try Again"
      onAction={onRetry}
      variant="default"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  gradientContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 64,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationIcon: {
    fontSize: 64,
    lineHeight: 72,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 24,
  },
  actionButton: {
    minWidth: 160,
  },
});