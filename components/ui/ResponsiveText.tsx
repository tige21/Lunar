/**
 * ResponsiveText - Enhanced text component with automatic responsive scaling,
 * better overflow handling, and accessibility features
 */

import React from 'react';
import { StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import { ThemedText, ThemedTextProps } from '../ThemedText';
import { Typography, TextStyles, DeviceSize, AccessibilityText } from '@/constants/Typography';

interface ResponsiveTextProps extends ThemedTextProps {
  // Layout container options
  containerStyle?: ViewStyle;
  maxWidth?: number | string;
  centered?: boolean;
  
  // Text overflow and sizing
  autoScale?: boolean; // Auto-scale text to fit container
  minScale?: number; // Minimum scale factor (default: 0.8)
  maxLines?: number; // Maximum lines before truncation
  truncateMode?: 'tail' | 'head' | 'middle' | 'clip';
  
  // Responsive behavior
  adaptToDevice?: boolean; // Automatically adjust for device size
  accessibilityScale?: number; // Accessibility font scaling factor
  
  // Visual enhancements
  gradient?: boolean; // Apply text gradient (if supported)
  shadow?: boolean; // Add text shadow for readability
  
  // Layout helpers
  flex?: boolean; // Apply flex: 1
  wrap?: boolean; // Enable text wrapping
}

export function ResponsiveText({
  containerStyle,
  maxWidth,
  centered = false,
  autoScale = false,
  minScale = 0.8,
  maxLines,
  truncateMode = 'tail',
  adaptToDevice = true,
  accessibilityScale = 1,
  gradient = false,
  shadow = false,
  flex = false,
  wrap = true,
  style,
  children,
  ...props
}: ResponsiveTextProps) {
  
  // Determine text style adjustments based on device
  const getDeviceAdjustments = () => {
    if (!adaptToDevice) return {};
    
    const adjustments: any = {};
    
    // Small device adjustments
    if (DeviceSize.isSmallDevice) {
      adjustments.letterSpacing = -0.2; // Tighter letter spacing
      adjustments.lineHeight = undefined; // Let system calculate
    }
    
    // Tablet adjustments
    if (DeviceSize.isTablet) {
      adjustments.letterSpacing = 0.5; // More spacious
    }
    
    // Compact height adjustments
    if (DeviceSize.isCompact) {
      adjustments.marginVertical = -2; // Reduce vertical spacing
    }
    
    return adjustments;
  };
  
  // Apply accessibility scaling
  const getAccessibilityAdjustments = () => {
    if (accessibilityScale === 1) return {};
    
    return {
      fontSize: AccessibilityText.getAccessibleSize(
        (style as any)?.fontSize || Typography.sizes.base,
        accessibilityScale
      ),
    };
  };
  
  // Text shadow for better readability
  const getShadowStyle = () => {
    if (!shadow) return {};
    
    return {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    };
  };
  
  // Container styles
  const containerStyles = [
    containerStyle,
    maxWidth && { maxWidth },
    centered && styles.centered,
    flex && styles.flex,
  ];
  
  // Text styles
  const textStyles = [
    style,
    wrap && styles.wrap,
    getDeviceAdjustments(),
    getAccessibilityAdjustments(),
    getShadowStyle(),
  ];
  
  // If we need a container for layout
  if (containerStyle || maxWidth || centered || flex) {
    return (
      <View style={containerStyles}>
        <ThemedText
          {...props}
          style={textStyles}
          numberOfLines={maxLines}
          ellipsizeMode={truncateMode}
          adjustsFontSizeToFit={autoScale}
          minimumFontScale={minScale}
        >
          {children}
        </ThemedText>
      </View>
    );
  }
  
  // Simple text without container
  return (
    <ThemedText
      {...props}
      style={textStyles}
      numberOfLines={maxLines}
      ellipsizeMode={truncateMode}
      adjustsFontSizeToFit={autoScale}
      minimumFontScale={minScale}
    >
      {children}
    </ThemedText>
  );
}

/**
 * Pre-configured text components for common use cases
 */

// Hero text for welcome screens
export function HeroText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="hero"
      autoScale
      maxLines={2}
      centered
      adaptToDevice
      shadow
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

// Page title text
export function TitleText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="title"
      autoScale
      maxLines={3}
      centered
      adaptToDevice
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

// Body text with optimal readability
export function BodyText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="body"
      wrap
      adaptToDevice
      maxWidth="90%"
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

// Caption text for fine print
export function CaptionText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="caption"
      wrap
      adaptToDevice
      maxWidth="85%"
      centered
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

// Metric display text
export function MetricText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="metric"
      autoScale
      maxLines={1}
      centered
      adaptToDevice
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

// Label text for forms and UI
export function LabelText({ children, ...props }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      type="label"
      maxLines={1}
      adaptToDevice
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  wrap: {
    flexWrap: 'wrap',
  },
});

export default ResponsiveText;