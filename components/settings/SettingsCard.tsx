import React, { useMemo } from 'react';
import { StyleSheet, Pressable, Switch, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHapticFeedback, useSettingsAnimation } from './core/SettingsHooks';
import { TOUCH_TARGETS } from './core/SettingsConstants';
import { SettingsCardProps } from './core/SettingsTypes';
import { Colors, DesignTokens } from '@/constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SettingsCard({
  id,
  title,
  description,
  icon,
  type,
  value,
  options,
  range,
  unit,
  disabled = false,
  variant = 'default',
  onValueChange,
  onPress,
  children,
}: SettingsCardProps) {
  const colorScheme = useColorScheme();
  const { triggerHaptic } = useHapticFeedback();

  const primaryColor = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

  const scaleValue = useSharedValue(1);
  const glowValue = useSharedValue(0);

  const variantStyles = useMemo(() => {
    const variants = {
      default: {
        accent: primaryColor,
        themedVariant: 'card' as const,
      },
      sleep: {
        accent: primaryColor,
        themedVariant: 'sleep-card' as const,
      },
      ai: {
        accent: Colors.semantic.warning,
        themedVariant: 'card' as const,
      },
      privacy: {
        accent: Colors.semantic.error,
        themedVariant: 'card' as const,
      },
      premium: {
        accent: primaryColor,
        themedVariant: 'premium-card' as const,
      },
    };
    return variants[variant] || variants.default;
  }, [variant, primaryColor]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: glowValue.value * 0.15,
    elevation: glowValue.value * 4,
  }), []);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    glowValue.value = withTiming(1, { duration: 150 });
    triggerHaptic('light');
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
    glowValue.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    if (disabled) return;

    if (type === 'toggle' && onValueChange) {
      onValueChange(!value);
      triggerHaptic('medium');
    } else if (onPress) {
      onPress();
      triggerHaptic('light');
    }
  };

  const renderControl = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value}
            onValueChange={(newValue) => {
              if (onValueChange) onValueChange(newValue);
              triggerHaptic('selection');
            }}
            trackColor={{
              false: colorScheme === 'dark' ? '#374151' : '#D1D5DB',
              true: variantStyles.accent,
            }}
            thumbColor={value ? '#FFFFFF' : (colorScheme === 'dark' ? '#9CA3AF' : '#F3F4F6')}
            ios_backgroundColor={colorScheme === 'dark' ? '#374151' : '#D1D5DB'}
            disabled={disabled}
            style={styles.switch}
          />
        );

      case 'slider':
        return (
          <ThemedView style={styles.sliderContainer}>
            <ThemedText style={[styles.valueText, { color: variantStyles.accent }]}>
              {value}{unit && ` ${unit}`}
            </ThemedText>
          </ThemedView>
        );

      case 'picker':
        return (
          <ThemedView style={styles.pickerContainer}>
            <ThemedText style={[styles.valueText, { color: variantStyles.accent }]}>
              {options?.find(opt => opt.value === value)?.label || value}
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={textSecondary}
            />
          </ThemedView>
        );

      case 'navigation':
        return (
          <IconSymbol
            name="chevron.right"
            size={20}
            color={textSecondary}
          />
        );

      case 'button':
        return (
          <ThemedView style={[styles.buttonControl, { borderColor: variantStyles.accent }]}>
            <ThemedText style={[styles.buttonText, { color: variantStyles.accent }]}>
              Действие
            </ThemedText>
          </ThemedView>
        );

      default:
        return null;
    }
  };

  const isInteractive = ['toggle', 'picker', 'navigation', 'button'].includes(type) || !!onPress;

  return (
    <AnimatedPressable
      style={[animatedCardStyle, { opacity: disabled ? 0.5 : 1 }]}
      onPressIn={isInteractive ? handlePressIn : undefined}
      onPressOut={isInteractive ? handlePressOut : undefined}
      onPress={isInteractive ? handlePress : undefined}
      disabled={disabled}
      accessibilityRole={type === 'toggle' ? 'switch' : type === 'button' ? 'button' : 'none'}
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{
        disabled,
        ...(type === 'toggle' && { checked: value }),
      }}
    >
      <ThemedView
        variant={variantStyles.themedVariant}
        shadow="soft"
        borderRadius="lg"
        style={styles.card}
      >
        {renderCardContent()}
      </ThemedView>
    </AnimatedPressable>
  );

  function renderCardContent() {
    return (
      <>
        <ThemedView style={styles.cardContent}>
          <ThemedView style={styles.leftContent}>
            {icon && (
              <ThemedView
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${variantStyles.accent}15` },
                ]}
              >
                <IconSymbol
                  name={icon}
                  size={20}
                  color={variantStyles.accent}
                />
              </ThemedView>
            )}

            <ThemedView style={styles.textContent}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              {description && (
                <ThemedText style={styles.description}>{description}</ThemedText>
              )}
              {variant === 'premium' && (
                <ThemedView style={styles.premiumBadge}>
                  <IconSymbol name="star.fill" size={12} color={theme.colors.accent} />
                  <ThemedText style={[styles.premiumText, { color: theme.colors.accent }]}>
                    Premium
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.rightContent}>
            {renderControl()}
          </ThemedView>
        </ThemedView>

        {children && (
          <ThemedView style={styles.childrenContainer}>
            {children}
          </ThemedView>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    marginVertical: DesignTokens.spacing.xs,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    minHeight: TOUCH_TARGETS.recommended,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.sm,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.fontSize.base,
    fontWeight: '600',
    lineHeight: 20,
  },
  description: {
    fontSize: DesignTokens.fontSize.sm,
    opacity: 0.7,
    marginTop: 2,
    lineHeight: 16,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: TOUCH_TARGETS.minimum,
    minHeight: TOUCH_TARGETS.minimum,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
  },
  sliderContainer: {
    alignItems: 'flex-end',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  valueText: {
    fontSize: DesignTokens.fontSize.base,
    fontWeight: '600',
  },
  buttonControl: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.sm,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: DesignTokens.fontSize.sm,
    fontWeight: '500',
  },
  childrenContainer: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.md,
    paddingTop: 0,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});