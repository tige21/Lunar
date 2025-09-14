import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  measure,
  useAnimatedRef,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useHapticFeedback } from './core/SettingsHooks';
import { ANIMATION_PRESETS } from './core/SettingsConstants';
import { SettingsSectionProps } from './core/SettingsTypes';
import { Colors, DesignTokens } from '@/constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SettingsSection({
  id,
  title,
  description,
  icon,
  expanded = false,
  collapsible = true,
  variant = 'default',
  children,
  onToggleExpand,
}: SettingsSectionProps) {
  const { triggerHaptic } = useHapticFeedback();

  const primaryColor = useThemeColor({}, 'tint');

  const contentRef = useAnimatedRef();
  const contentHeight = useSharedValue(0);
  const animatedHeight = useSharedValue(expanded ? 1 : 0);
  const rotationValue = useSharedValue(expanded ? 1 : 0);
  const scaleValue = useSharedValue(1);

  const variantConfig = useMemo(() => {
    const configs = {
      default: {
        headerGradient: [primaryColor, '#A78BFA'],
        iconColor: primaryColor,
        accentColor: primaryColor,
      },
      sleep: {
        headerGradient: [primaryColor, '#A78BFA'],
        iconColor: primaryColor,
        accentColor: primaryColor,
      },
      ai: {
        headerGradient: [Colors.semantic.warning, '#FCD34D'],
        iconColor: Colors.semantic.warning,
        accentColor: Colors.semantic.warning,
      },
      premium: {
        headerGradient: [primaryColor, '#A78BFA', '#C084FC'],
        iconColor: primaryColor,
        accentColor: primaryColor,
      },
    };
    return configs[variant] || configs.default;
  }, [variant, primaryColor]);

  // Animation styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }), []);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotationValue.value * 180}deg` },
    ],
  }), []);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value === 0 ? 0 : animatedHeight.value * contentHeight.value,
      opacity: animatedHeight.value,
    };
  }, []);

  // Measure content height when expanded
  useEffect(() => {
    if (expanded) {
      setTimeout(() => {
        runOnJS(() => {
          if (contentRef.current) {
            contentHeight.value = measure(contentRef.current)?.height || 0;
          }
        })();
      }, 50);
    }
  }, [expanded, children]);

  // Animate expansion/collapse
  useEffect(() => {
    const config = ANIMATION_PRESETS.smoothExpand;
    animatedHeight.value = withTiming(expanded ? 1 : 0, config);
    rotationValue.value = withSpring(expanded ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [expanded]);

  const handlePress = () => {
    if (!collapsible) return;

    triggerHaptic('light');
    onToggleExpand?.(!expanded);
  };

  const handlePressIn = () => {
    if (collapsible) {
      scaleValue.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (collapsible) {
      scaleValue.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Section Header */}
      <AnimatedPressable
        style={headerAnimatedStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!collapsible}
        accessibilityRole="button"
        accessibilityLabel={`${title} section`}
        accessibilityHint={
          collapsible
            ? `Double tap to ${expanded ? 'collapse' : 'expand'} section`
            : 'Section header'
        }
        accessibilityState={{ expanded }}
      >
        <LinearGradient
          colors={variantConfig.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <ThemedView style={styles.headerContent}>
            <ThemedView style={styles.headerLeft}>
              {icon && (
                <ThemedView style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <IconSymbol
                    name={icon}
                    size={24}
                    color="white"
                  />
                </ThemedView>
              )}

              <ThemedView style={styles.headerText}>
                <ThemedText style={styles.headerTitle}>{title}</ThemedText>
                {description && (
                  <ThemedText style={styles.headerDescription}>{description}</ThemedText>
                )}
              </ThemedView>
            </ThemedView>

            {collapsible && (
              <Animated.View style={[styles.chevronContainer, chevronAnimatedStyle]}>
                <IconSymbol
                  name="chevron.down"
                  size={20}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </Animated.View>
            )}
          </ThemedView>

          {/* Premium indicator */}
          {variant === 'premium' && (
            <ThemedView style={styles.premiumIndicator}>
              <IconSymbol name="star.fill" size={14} color="rgba(255, 255, 255, 0.9)" />
            </ThemedView>
          )}
        </LinearGradient>
      </AnimatedPressable>

      {/* Collapsible Content */}
      <Animated.View style={contentAnimatedStyle}>
        <ThemedView
          ref={contentRef}
          variant="surface"
          style={styles.contentContainer}
          onLayout={(event) => {
            if (expanded && contentHeight.value === 0) {
              contentHeight.value = event.nativeEvent.layout.height;
            }
          }}
        >
          <ThemedView style={styles.content}>
            {children}
          </ThemedView>
        </ThemedView>
      </Animated.View>

      {/* Bottom border decoration */}
      {expanded && (
        <ThemedView style={styles.bottomBorder}>
          <LinearGradient
            colors={[variantConfig.accentColor + '30', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.borderGradient}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius['2xl'],
    overflow: 'hidden',
    ...DesignTokens.shadows.medium,
  },
  header: {
    position: 'relative',
    minHeight: 64,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DesignTokens.fontSize.lg,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  headerDescription: {
    fontSize: DesignTokens.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    lineHeight: 16,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIndicator: {
    position: 'absolute',
    top: DesignTokens.spacing.xs,
    right: DesignTokens.spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.xs,
  },
  bottomBorder: {
    height: 3,
    marginHorizontal: DesignTokens.spacing.lg,
  },
  borderGradient: {
    flex: 1,
    height: '100%',
  },
});