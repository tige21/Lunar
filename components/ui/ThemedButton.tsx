import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '../ThemedText';

export type ThemedButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sleep' | 'wake' | 'sleep-action';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
};

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  style,
  ...otherProps
}: ThemedButtonProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const getButtonStyles = () => {
    const baseStyles = [
      styles.base,
      styles[size],
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
    ];

    switch (variant) {
      case 'primary':
        return [...baseStyles, { backgroundColor: primaryColor }];
      case 'secondary':
        return [...baseStyles, { backgroundColor: Colors.semantic.info }];
      case 'sleep':
        return [...baseStyles, { backgroundColor: Colors.sleepStages.deep }, styles.shadow];
      case 'wake':
        return [...baseStyles, { backgroundColor: Colors.sleepStages.wake }, styles.shadow];
      case 'sleep-action':
        return [...baseStyles, { backgroundColor: primaryColor }, styles.sleepAction];
      case 'outline':
        return [...baseStyles, styles.outline, { borderColor: primaryColor }];
      case 'ghost':
        return [...baseStyles, styles.ghost];
      default:
        return [...baseStyles, { backgroundColor: primaryColor }];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return primaryColor;
      default:
        return '#FFFFFF';
    }
  };

  const getTextType = () => {
    switch (size) {
      case 'sm':
        return 'caption';
      case 'lg':
        return 'defaultSemiBold';
      case 'xl':
        return 'heading';
      default:
        return 'body';
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      {...otherProps}
    >
      {leftIcon && !isLoading && leftIcon}
      
      <ThemedText
        type={getTextType()}
        style={[
          styles.text,
          { color: getTextColor() },
          leftIcon && styles.textWithLeftIcon,
          rightIcon && styles.textWithRightIcon,
        ]}
      >
        {isLoading ? 'Loading...' : children}
      </ThemedText>
      
      {rightIcon && !isLoading && rightIcon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 0,
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 8,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 12,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 16,
  },
  xl: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    minHeight: 60,
    borderRadius: 20,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  shadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sleepAction: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: 8,
  },
  textWithRightIcon: {
    marginRight: 8,
  },
});

export default ThemedButton;