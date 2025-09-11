import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'label' | 'sleep-data' | 'metric';
  type?: 'default' | 'primary' | 'secondary' | 'muted' | 'inverse' | 'success' | 'warning' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
};

export function ThemedText({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'body',
  type = 'default',
  weight,
  align,
  ...otherProps 
}: ThemedTextProps) {
  const getTextColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    }
    
    switch (type) {
      case 'primary':
        return useThemeColor({}, 'tint');
      case 'secondary':
        return useThemeColor({ 
          light: Colors.light.icon, 
          dark: Colors.dark.icon 
        }, 'text');
      case 'muted':
        return useThemeColor({ 
          light: '#9CA3AF', 
          dark: '#6B7280' 
        }, 'text');
      case 'inverse':
        return useThemeColor({ 
          light: '#FFFFFF', 
          dark: '#000000' 
        }, 'text');
      case 'success':
        return Colors.semantic.success;
      case 'warning':
        return Colors.semantic.warning;
      case 'error':
        return Colors.semantic.error;
      default:
        return useThemeColor({}, 'text');
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'display':
        return styles.display;
      case 'heading':
        return styles.heading;
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      case 'sleep-data':
        return styles.sleepData;
      case 'metric':
        return styles.metric;
      default:
        return styles.body;
    }
  };

  const getWeightStyles = () => {
    if (!weight) return null;
    switch (weight) {
      case 'medium':
        return styles.weightMedium;
      case 'semibold':
        return styles.weightSemibold;
      case 'bold':
        return styles.weightBold;
      default:
        return null;
    }
  };

  const getAlignStyles = () => {
    if (!align) return null;
    return { textAlign: align };
  };

  const color = getTextColor();

  return (
    <Text
      style={[
        { color },
        getVariantStyles(),
        getWeightStyles(),
        getAlignStyles(),
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    letterSpacing: -2,
  },
  heading: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -1,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    letterSpacing: -0.25,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sleepData: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    letterSpacing: -0.5,
  },
  metric: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    letterSpacing: -1,
  },
  weightMedium: {
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  weightSemibold: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  weightBold: {
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default ThemedText;