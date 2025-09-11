import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'surface' | 'card' | 'container' | 'modal' | 'gradient' | 'sleep-surface' | 'sleep-card';
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  gradientColors,
  gradientDirection = 'vertical',
  children,
  ...otherProps 
}: ThemedViewProps) {
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    }
    
    switch (variant) {
      case 'surface':
        return useThemeColor({}, 'surface');
      case 'card':
        return useThemeColor({}, 'card');
      case 'sleep-surface':
        return useThemeColor({ 
          light: Colors.light.sleep.background, 
          dark: Colors.dark.sleep.background 
        }, 'background');
      case 'sleep-card':
        return useThemeColor({ 
          light: Colors.light.surface, 
          dark: Colors.dark.surface 
        }, 'surface');
      case 'container':
        return useThemeColor({ 
          light: '#FFFFFF', 
          dark: Colors.dark.surface 
        }, 'surface');
      case 'modal':
        return useThemeColor({ 
          light: '#FFFFFF', 
          dark: Colors.dark.card 
        }, 'surface');
      case 'gradient':
        return 'transparent';
      default:
        return useThemeColor({}, 'background');
    }
  };

  const getGradientStart = () => {
    switch (gradientDirection) {
      case 'horizontal':
        return { x: 0, y: 0.5 };
      case 'diagonal':
        return { x: 0, y: 0 };
      default: // vertical
        return { x: 0.5, y: 0 };
    }
  };

  const getGradientEnd = () => {
    switch (gradientDirection) {
      case 'horizontal':
        return { x: 1, y: 0.5 };
      case 'diagonal':
        return { x: 1, y: 1 };
      default: // vertical
        return { x: 0.5, y: 1 };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
      case 'sleep-card':
        return styles.card;
      case 'container':
        return styles.container;
      case 'modal':
        return styles.modal;
      case 'surface':
      case 'sleep-surface':
        return styles.surface;
      default:
        return null;
    }
  };

  if (variant === 'gradient' && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={getGradientStart()}
        end={getGradientEnd()}
        style={[getVariantStyles(), style]}
        {...otherProps}
      >
        {children}
      </LinearGradient>
    );
  }

  const backgroundColor = getBackgroundColor();

  return (
    <View 
      style={[
        { backgroundColor }, 
        getVariantStyles(),
        style
      ]} 
      {...otherProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    borderRadius: 12,
    padding: 20,
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  surface: {
    borderRadius: 8,
  },
});

export default ThemedView;