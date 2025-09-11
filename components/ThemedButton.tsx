import React from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'sleep' | 'wake' | 'outline' | 'ghost' | 'gradient' | 'sleep-stage' | 'floating';
  size?: 'small' | 'medium' | 'large' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  sleepStage?: 'deep' | 'rem' | 'light' | 'wake';
  haptic?: boolean;
};

export function ThemedButton({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  sleepStage,
  haptic = true,
  style,
  disabled,
  onPress,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handlePress = (event: any) => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 8;
        baseStyle.height = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 32;
        baseStyle.paddingVertical = 16;
        baseStyle.height = 56;
        break;
      case 'xl':
        baseStyle.paddingHorizontal = 40;
        baseStyle.paddingVertical = 20;
        baseStyle.height = 64;
        baseStyle.borderRadius = 16;
        break;
      default: // medium
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 12;
        baseStyle.height = 48;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = surfaceColor;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = borderColor;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors.light.tint;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'sleep':
        baseStyle.backgroundColor = Colors.sleepStages.deep;
        break;
      case 'wake':
        baseStyle.backgroundColor = Colors.sleepStages.wake;
        break;
      case 'floating':
        baseStyle.backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1E1B3C' }, 'surface');
        baseStyle.shadowColor = '#0F0A1E';
        baseStyle.shadowOffset = { width: 0, height: 4 };
        baseStyle.shadowOpacity = 0.3;
        baseStyle.shadowRadius = 8;
        baseStyle.elevation = 8;
        baseStyle.borderRadius = size === 'xl' ? 20 : size === 'large' ? 16 : 12;
        break;
      case 'sleep-stage':
        baseStyle.backgroundColor = sleepStage ? Colors.sleepStages[sleepStage] : Colors.sleepStages.deep;
        break;
      case 'gradient':
      case 'primary':
      default: // primary
        // Will use gradient
        baseStyle.backgroundColor = 'transparent';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary':
      case 'ghost':
      case 'floating':
        return textColor;
      case 'outline':
        return Colors.light.tint;
      case 'primary':
      case 'gradient':
      case 'sleep':
      case 'wake':
      case 'sleep-stage':
        return '#FFFFFF';
      default:
        return textColor;
    }
  };

  const getTextSize = (): 'default' | 'defaultSemiBold' => {
    return size === 'small' ? 'default' : 'defaultSemiBold';
  };

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'gradient':
        return ['#F59E0B', '#EA580C']; // Warm sunrise gradient
      case 'sleep-stage':
        if (sleepStage === 'wake') return ['#F59E0B', '#EA580C'];
        if (sleepStage === 'light') return ['#6366F1', '#4C1D95'];
        if (sleepStage === 'rem') return ['#5B21B6', '#3B1A78'];
        return ['#1E1B3C', '#0F0A1E']; // deep sleep
      default:
        return ['#8B5CF6', '#5B21B6']; // Default primary gradient
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={{ marginRight: 8 }} 
        />
      ) : (
        icon && iconPosition === 'left' && (
          <React.Fragment>
            {icon}
            <ThemedText style={{ width: 8 }} />
          </React.Fragment>
        )
      )}
      
      <ThemedText
        type={getTextSize()}
        style={{ 
          color: getTextColor(),
          fontSize: size === 'small' ? 14 : size === 'large' ? 18 : size === 'xl' ? 20 : 16,
        }}
      >
        {title}
      </ThemedText>
      
      {!loading && icon && iconPosition === 'right' && (
        <React.Fragment>
          <ThemedText style={{ width: 8 }} />
          {icon}
        </React.Fragment>
      )}
    </>
  );

  const buttonStyle = getButtonStyle();
  const gradientColors = getGradientColors();

  if (variant === 'primary' || variant === 'gradient' || variant === 'sleep-stage') {
    return (
      <Pressable
        style={[buttonStyle, style]}
        disabled={disabled || loading}
        onPress={handlePress}
        {...rest}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: buttonStyle.borderRadius || 12 }
          ]}
        />
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      onPress={handlePress}
      {...rest}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});