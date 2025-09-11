import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  RefreshControl,
} from 'react-native';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ScrollContainerProps = ScrollViewProps & {
  refreshing?: boolean;
  onRefresh?: () => void;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
};

export function ScrollContainer({
  children,
  refreshing = false,
  onRefresh,
  padding,
  paddingHorizontal = 20,
  paddingVertical = 0,
  style,
  contentContainerStyle,
  ...rest
}: ScrollContainerProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      colors={[tintColor]}
    />
  ) : undefined;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }, style]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingHorizontal: padding ?? paddingHorizontal,
          paddingVertical: padding ?? paddingVertical,
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});