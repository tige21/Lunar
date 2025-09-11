import { View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors, DesignTokens } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'surface' | 'card' | 'sleep-surface' | 'container' | 'modal' | 'gradient' | 'sleep-card' | 'metric-card' | 'compact-card' | 'glass' | 'glass-strong' | 'premium-card' | 'floating-card';
  shadow?: 'none' | 'soft' | 'medium' | 'strong' | 'glow';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  gradient?: boolean;
  glassEffect?: boolean;
  children?: React.ReactNode;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  shadow = 'none',
  borderRadius = 'none',
  gradient = false,
  glassEffect = false,
  children,
  ...otherProps 
}: ThemedViewProps) {
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    }
    
    switch (variant) {
      case 'surface':
        return useThemeColor({ light: Colors.light.surfaceSolid, dark: Colors.dark.surfaceSolid }, 'surface');
      case 'card':
        return useThemeColor({ light: Colors.light.cardSolid, dark: Colors.dark.cardSolid }, 'card');
      case 'sleep-surface':
        return useThemeColor({ light: Colors.light.sleep.backgroundSolid, dark: Colors.dark.sleep.backgroundSolid }, 'background');
      case 'sleep-card':
        return useThemeColor({ light: 'rgba(255, 255, 255, 0.95)', dark: 'rgba(45, 27, 105, 0.95)' }, 'surface');
      case 'metric-card':
        return useThemeColor({ light: 'rgba(248, 250, 252, 0.9)', dark: 'rgba(30, 27, 60, 0.9)' }, 'surface');
      case 'compact-card':
        return useThemeColor({ light: 'rgba(255, 255, 255, 0.9)', dark: 'rgba(59, 26, 120, 0.9)' }, 'surface');
      case 'premium-card':
        return useThemeColor({ light: 'rgba(255, 255, 255, 0.95)', dark: 'rgba(30, 27, 60, 0.95)' }, 'surface');
      case 'floating-card':
        return useThemeColor({ light: 'rgba(255, 255, 255, 0.8)', dark: 'rgba(45, 27, 105, 0.8)' }, 'surface');
      case 'container':
        return useThemeColor({ light: Colors.light.surfaceSolid, dark: Colors.dark.surfaceSolid }, 'surface');
      case 'modal':
        return useThemeColor({ light: Colors.light.surfaceSolid, dark: Colors.dark.surfaceSolid }, 'surface');
      case 'glass':
        return useThemeColor({ light: Colors.light.glass.background, dark: Colors.dark.glass.background }, 'background');
      case 'glass-strong':
        return useThemeColor({ light: 'rgba(255, 255, 255, 0.4)', dark: 'rgba(30, 27, 60, 0.6)' }, 'background');
      case 'gradient':
        return 'transparent'; // Handle gradients separately
      default:
        return useThemeColor({}, 'background');
    }
  };

  const getShadowStyle = () => {
    switch (shadow) {
      case 'soft':
        return DesignTokens.shadows.soft;
      case 'medium':
        return DesignTokens.shadows.medium;
      case 'strong':
        return DesignTokens.shadows.strong;
      case 'glow':
        return DesignTokens.shadows.glow;
      default:
        return {};
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'sm': return DesignTokens.borderRadius.sm;
      case 'md': return DesignTokens.borderRadius.md;
      case 'lg': return DesignTokens.borderRadius.lg;
      case 'xl': return DesignTokens.borderRadius.xl;
      case '2xl': return DesignTokens.borderRadius['2xl'];
      case '3xl': return DesignTokens.borderRadius['3xl'];
      case 'full': return DesignTokens.borderRadius.full;
      case 'none': return 0;
      default: return undefined;
    }
  };

  const getGlassEffectStyle = () => {
    if (variant?.includes('glass') || glassEffect) {
      return {
        borderWidth: 1,
        borderColor: useThemeColor({ 
          light: Colors.light.glass.border, 
          dark: Colors.dark.glass.border 
        }, 'border'),
        backdropFilter: 'blur(20px)',
      };
    }
    return {};
  };

  const backgroundColor = getBackgroundColor();
  const shadowStyle = getShadowStyle();
  const borderRadiusValue = getBorderRadius();
  const glassStyle = getGlassEffectStyle();

  // Handle gradient backgrounds
  if (variant === 'gradient' || gradient) {
    return (
      <LinearGradient
        colors={[
          useThemeColor({ light: Colors.light.backgroundSolid, dark: Colors.dark.backgroundSolid }, 'background'),
          useThemeColor({ light: Colors.light.sleep.backgroundSolid, dark: Colors.dark.sleep.backgroundSolid }, 'background')
        ]}
        style={[
          borderRadiusValue !== undefined && { borderRadius: borderRadiusValue },
          shadowStyle,
          glassStyle,
          style,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        {...otherProps}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View 
      style={[
        { backgroundColor },
        borderRadiusValue !== undefined && { borderRadius: borderRadiusValue },
        shadowStyle,
        glassStyle,
        style,
      ]} 
      {...otherProps}
    >
      {children}
    </View>
  );
}