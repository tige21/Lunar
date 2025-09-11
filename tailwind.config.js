/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './node_modules/@gluestack-ui/themed/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          0: '#FFFFFF',
          50: '#F0F4FF',
          100: '#D6E4FF',
          200: '#B8CCFF',
          300: '#8DA4FF',
          400: '#6C79FF',
          500: '#5B21B6', // Deep purple for primary sleep theme
          600: '#4C1D95',
          700: '#3B1A78',
          800: '#2D1B69',
          900: '#1E1B3C',
          950: '#0F0A1E',
        },
        secondary: {
          0: '#FFFFFF',
          50: '#FEF3E2',
          100: '#FDE5B8',
          200: '#FBD288',
          300: '#F9BC4D',
          400: '#F7A532', // Warm orange for sunrise/wake
          500: '#EA580C',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        lunar: {
          primary: '#5B21B6', // Deep purple
          secondary: '#EA580C', // Warm orange
          accent: '#3B82F6', // Blue accent
          dark: '#0F0A1E',
          darker: '#0C0A1A',
          light: '#1E1B3C',
          text: '#F3F4F6',
          muted: '#6B7280',
        },
        sleep: {
          deep: '#1E1B3C', // Deep sleep stage
          rem: '#3B1A78', // REM sleep stage
          light: '#4C1D95', // Light sleep stage
          wake: '#EA580C', // Wake/alert periods
          background: '#0F0A1E', // Dark background for night mode
          surface: '#1E1B3C', // Surface elements
          card: '#2D1B69', // Card backgrounds
        },
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      fontFamily: {
        'space-mono': ['SpaceMono', 'monospace'],
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '10px',
        'xs': '12px',
        'sm': '14px',
        'md': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px',
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}