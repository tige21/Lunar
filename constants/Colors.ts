/**
 * Sleep-optimized color palette for the Lunar app.
 * Designed for comfortable night-time viewing with calming deep purples
 * and warm sunrise colors for wake periods.
 */

// Enhanced sleep theme colors with better accessibility
const sleepPrimaryLight = '#5B21B6'; // Deep purple for light mode
const sleepPrimaryDark = '#8B5CF6'; // Lighter purple for dark mode  
const sleepSecondary = '#EA580C'; // Warm orange for wake/sunrise
const sleepAccent = '#F59E0B'; // Bright amber for highlights

export const Colors = {
  light: {
    text: '#1F2937',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    backgroundSolid: '#F8FAFC',
    tint: sleepPrimaryLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: sleepPrimaryLight,
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceSolid: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.8)',
    cardSolid: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: 'rgba(226, 232, 240, 0.5)',
    // Sleep-specific colors with enhanced gradients
    sleep: {
      deep: '#1E1B3C',
      rem: '#3B1A78',
      light: '#4C1D95',
      wake: sleepSecondary,
      background: 'linear-gradient(135deg, #F0F4FF 0%, #E0E7FF 100%)',
      backgroundSolid: '#F0F4FF',
    },
    // Glass morphism effects
    glass: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    text: '#F1F5F9',
    background: 'linear-gradient(135deg, #0F0A1E 0%, #1E1B3C 100%)',
    backgroundSolid: '#0F0A1E',
    tint: sleepPrimaryDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: sleepPrimaryDark,
    surface: 'rgba(30, 27, 60, 0.95)',
    surfaceSolid: '#1E1B3C',
    card: 'rgba(45, 27, 105, 0.8)',
    cardSolid: '#2D1B69',
    border: '#334155',
    borderLight: 'rgba(51, 65, 85, 0.5)',
    // Sleep-specific colors with enhanced gradients
    sleep: {
      deep: '#1E1B3C',
      rem: '#3B1A78', 
      light: '#4C1D95',
      wake: sleepSecondary,
      background: 'linear-gradient(135deg, #0F0A1E 0%, #1E1B3C 100%)',
      backgroundSolid: '#0F0A1E',
    },
    // Glass morphism effects for dark mode
    glass: {
      background: 'rgba(30, 27, 60, 0.4)',
      border: 'rgba(139, 92, 246, 0.2)',
      shadow: 'rgba(139, 92, 246, 0.15)',
    },
  },
  // Enhanced semantic colors with gradients
  semantic: {
    success: '#10B981',
    successLight: '#D1FAE5',
    successGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    infoGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  },
  // Sleep stage colors for data visualization
  sleepStages: {
    deep: '#1E1B3C',
    rem: '#3B1A78',
    light: '#4C1D95',
    wake: '#EA580C',
    awake: '#F7A532',
  },
};

// Enhanced design system tokens
export const DesignTokens = {
  // Spacing scale (8px grid system)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  // Border radius scale
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  // Typography scale
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 64,
    '7xl': 72,
  },
  // Shadow presets
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    glow: {
      shadowColor: '#5B21B6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

// Export enhanced color tokens for Gluestack UI
export const LunarColorTokens = {
  primary: {
    50: '#F0F4FF',
    100: '#E0E7FF', 
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#8B5CF6',
    500: '#5B21B6',
    600: '#4C1D95',
    700: '#3B1A78',
    800: '#2D1B69',
    900: '#1E1B3C',
    950: '#0F0A1E',
  },
  secondary: {
    50: '#FEF7ED',
    100: '#FDEDD3',
    200: '#FBD7A6',
    300: '#F9BC4D',
    400: '#F7A532',
    500: '#EA580C',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  // Glass morphism color tokens
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    medium: 'rgba(255, 255, 255, 0.15)',
    dark: 'rgba(30, 27, 60, 0.4)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};
