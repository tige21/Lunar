import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Keyboard, Platform, Dimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/contexts/SettingsContext';
import { ANIMATION_PRESETS, PERFORMANCE, PLATFORM_CONSTANTS } from './SettingsConstants';
import { SettingsScreenState } from './SettingsTypes';

// Enhanced settings hook with optimistic updates and caching
export function useSettingsManager() {
  const { settings, updateSettings, isLoading, error } = useSettings();
  const [optimisticSettings, setOptimisticSettings] = useState(settings);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const updateSettingOptimistic = useCallback(async (path: string, value: any) => {
    // Immediate UI update
    const pathParts = path.split('.');
    const updatedSettings = { ...optimisticSettings };
    let current = updatedSettings;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]] = { ...current[pathParts[i]] };
    }
    current[pathParts[pathParts.length - 1]] = value;

    setOptimisticSettings(updatedSettings);

    // Debounced actual update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateSettings(updatedSettings);
      } catch (err) {
        // Revert on error
        setOptimisticSettings(settings);
        throw err;
      }
    }, PERFORMANCE.debounceMs);
  }, [optimisticSettings, updateSettings, settings]);

  // Sync optimistic with actual settings
  useEffect(() => {
    setOptimisticSettings(settings);
  }, [settings]);

  return {
    settings: optimisticSettings,
    updateSetting: updateSettingOptimistic,
    isLoading,
    error,
  };
}

// Settings screen state management
export function useSettingsScreen() {
  const [state, setState] = useState<SettingsScreenState>({
    searchQuery: '',
    expandedSections: new Set(['appearance']), // Default expanded
    animationStates: new Map(),
    scrollPosition: 0,
  });

  const updateState = useCallback((updates: Partial<SettingsScreenState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return { ...prev, expandedSections: newExpanded };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    updateState({ searchQuery: query });
  }, [updateState]);

  return {
    ...state,
    toggleSection,
    setSearchQuery,
    updateState,
  };
}

// Animated value hook for smooth interactions
export function useSettingsAnimation(initialValue: number = 0) {
  const animatedValue = useSharedValue(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateTo = useCallback((
    toValue: number,
    preset: keyof typeof ANIMATION_PRESETS = 'smoothExpand',
    callback?: () => void
  ) => {
    setIsAnimating(true);
    const config = ANIMATION_PRESETS[preset];

    animatedValue.value = withTiming(
      toValue,
      {
        duration: config.duration,
        easing: config.easing,
      },
      () => {
        runOnJS(setIsAnimating)(false);
        if (callback) runOnJS(callback)();
      }
    );
  }, [animatedValue]);

  const animateSpring = useCallback((
    toValue: number,
    damping: number = 15,
    stiffness: number = 100,
    callback?: () => void
  ) => {
    setIsAnimating(true);
    animatedValue.value = withSpring(
      toValue,
      { damping, stiffness },
      () => {
        runOnJS(setIsAnimating)(false);
        if (callback) runOnJS(callback)();
      }
    );
  }, [animatedValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [{ scale: animatedValue.value }],
  }), []);

  return {
    animatedValue,
    animatedStyle,
    animateTo,
    animateSpring,
    isAnimating,
  };
}

// Platform-specific haptic feedback
export function useHapticFeedback() {
  const triggerHaptic = useCallback((
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
  ) => {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  }, []);

  const triggerSelection = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
  }, []);

  return { triggerHaptic, triggerSelection };
}

// Keyboard awareness hook
export function useKeyboardAware() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { keyboardHeight, keyboardVisible };
}

// Responsive design hook
export function useResponsiveLayout() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const layout = useMemo(() => {
    const { width, height } = dimensions;
    const isTablet = width >= 768;
    const isLandscape = width > height;

    return {
      width,
      height,
      isTablet,
      isLandscape,
      isPhone: !isTablet,
      breakpoint: width < 480 ? 'xs' : width < 768 ? 'sm' : width < 1024 ? 'md' : 'lg',
      safeAreaInsets: Platform.OS === 'ios'
        ? PLATFORM_CONSTANTS.ios.safeAreaInsets
        : PLATFORM_CONSTANTS.android.safeAreaInsets,
    };
  }, [dimensions]);

  return layout;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const renderTimeRef = useRef(Date.now());
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    reRenderCount: 0,
    lastUpdate: Date.now(),
  });

  useEffect(() => {
    const renderTime = Date.now() - renderTimeRef.current;
    setMetrics(prev => ({
      renderTime,
      reRenderCount: prev.reRenderCount + 1,
      lastUpdate: Date.now(),
    }));
    renderTimeRef.current = Date.now();
  });

  const logPerformance = useCallback((action: string, duration: number) => {
    if (__DEV__) {
      console.log(`[Settings Performance] ${action}: ${duration}ms`);
    }
  }, []);

  return { metrics, logPerformance };
}

// Search and filter hook
export function useSettingsSearch(allItems: any[], searchQuery: string) {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.keywords?.some((keyword: string) => keyword.toLowerCase().includes(query))
    );
  }, [allItems, searchQuery]);

  const highlightText = useCallback((text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '**$1**');
  }, [searchQuery]);

  return {
    filteredItems,
    highlightText,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
}