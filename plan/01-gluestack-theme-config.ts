/**
 * Gluestack-UI v2 Theme Configuration for Lunar Sleep Analysis App
 * 
 * This file defines the complete design system including colors, typography,
 * spacing, and component variants specifically for sleep analysis features.
 */

import { createConfig } from '@gluestack-ui/themed-native-base';

// Sleep-focused color palette
const sleepColors = {
  // Primary sleep brand colors
  lunar: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d5fe',
    300: '#a5b8fc',
    400: '#8b93f8',
    500: '#7b6ef2', // Primary lunar purple
    600: '#6c5ce7',
    700: '#5e4dd2',
    800: '#4d3faa',
    900: '#413687',
  },
  
  // Sleep quality indicators
  deepSleep: {
    50: '#eef7ff',
    100: '#d9ecff',
    200: '#bcdeff',
    300: '#8ecaff',
    400: '#59aaff',
    500: '#3282f6', // Deep sleep blue
    600: '#1c65eb',
    700: '#1551d8',
    800: '#1842af',
    900: '#1a3c8a',
  },
  
  lightSleep: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf', // Light sleep teal
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  rem: {
    50: '#fef7ee',
    100: '#feedd8',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // REM orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  awake: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Awake red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral grays for backgrounds and text
  moonstone: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Typography scale optimized for sleep data visualization
const typography = {
  fonts: {
    heading: 'Inter_600SemiBold',
    body: 'Inter_400Regular',
    mono: 'SpaceMono_400Regular',
  },
  
  fontSizes: {
    '2xs': 10,
    'xs': 12,
    'sm': 14,
    'md': 16,
    'lg': 18,
    'xl': 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  lineHeights: {
    '2xs': 16,
    'xs': 18,
    'sm': 20,
    'md': 24,
    'lg': 28,
    'xl': 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 56,
    '6xl': 72,
  },
  
  letterSpacings: {
    'xs': -0.05,
    'sm': 0,
    'md': 0.025,
    'lg': 0.05,
    'xl': 0.1,
    '2xl': 0.15,
  },
};

// Spacing system based on 4px grid
const space = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
  '32': 128,
  '40': 160,
  '48': 192,
  '56': 224,
  '64': 256,
};

// Border radius for sleep-themed components
const radii = {
  'none': 0,
  'xs': 2,
  'sm': 4,
  'md': 6,
  'lg': 8,
  'xl': 12,
  '2xl': 16,
  '3xl': 24,
  'full': 9999,
};

// Shadows for depth and elevation
const shadows = {
  'none': {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  'sm': {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.05,
  },
  'base': {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.1,
  },
  'md': {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    shadowOpacity: 0.07,
  },
  'lg': {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    shadowOpacity: 0.1,
  },
  'xl': {
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 25,
    shadowOpacity: 0.12,
  },
  '2xl': {
    shadowOffset: { width: 0, height: 25 },
    shadowRadius: 50,
    shadowOpacity: 0.25,
  },
};

// Main theme configuration
export const lunarTheme = createConfig({
  colors: sleepColors,
  space,
  radii,
  shadows,
  fonts: typography.fonts,
  fontSizes: typography.fontSizes,
  lineHeights: typography.lineHeights,
  letterSpacings: typography.letterSpacings,
  
  // Component-specific tokens
  tokens: {
    colors: sleepColors,
    space,
    radii,
    shadows,
    fonts: typography.fonts,
    fontSizes: typography.fontSizes,
    lineHeights: typography.lineHeights,
    letterSpacings: typography.letterSpacings,
  },
  
  // Global styles
  globalStyle: {
    body: {
      backgroundColor: '$moonstone50',
      color: '$moonstone900',
      fontFamily: '$body',
    },
  },
});

// Design tokens for easy access
export const designTokens = {
  colors: sleepColors,
  typography,
  spacing: space,
  borderRadius: radii,
  shadows,
  
  // Sleep-specific semantic tokens
  sleepStages: {
    deep: sleepColors.deepSleep[500],
    light: sleepColors.lightSleep[500],
    rem: sleepColors.rem[500],
    awake: sleepColors.awake[500],
  },
  
  // Score colors
  sleepScore: {
    excellent: sleepColors.deepSleep[500], // 90-100
    good: sleepColors.lightSleep[500],     // 70-89
    fair: sleepColors.rem[500],            // 50-69
    poor: sleepColors.awake[500],          // 0-49
  },
  
  // Common gradients
  gradients: {
    nightSky: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    moonGlow: 'linear-gradient(135deg, #7b6ef2 0%, #3282f6 100%)',
    sleepCycle: 'linear-gradient(90deg, #3282f6 0%, #2dd4bf 33%, #f97316 66%, #ef4444 100%)',
    dashboard: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
  },
};

// Breakpoints for responsive design
export const breakpoints = {
  base: 0,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
};

export default lunarTheme;