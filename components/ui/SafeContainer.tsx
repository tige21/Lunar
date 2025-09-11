import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { ThemedView, type ThemedViewProps } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export type SafeContainerProps = ThemedViewProps & {
  statusBarStyle?: 'light-content' | 'dark-content' | 'auto';
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function SafeContainer({
  children,
  statusBarStyle = 'auto',
  edges = ['top', 'bottom'],
  style,
  variant = 'default',
  ...rest
}: SafeContainerProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const isDark = backgroundColor === '#0F0A1E'; // Check if dark mode
  
  const getStatusBarStyle = () => {
    if (statusBarStyle === 'auto') {
      return isDark ? 'light-content' : 'dark-content';
    }
    return statusBarStyle;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={getStatusBarStyle()}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <ThemedView
        variant={variant}
        style={[styles.content, style]}
        {...rest}
      >
        {children}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});