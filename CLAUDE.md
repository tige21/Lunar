# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile app called "Lunar" built with Expo SDK 53. It uses TypeScript, React Navigation, and file-based routing with Expo Router. The app supports iOS, Android, and web platforms with a tabbed interface.

## Development Commands

- `npm start` or `expo start` - Start the development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start web version
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset to blank project template

## Project Structure

- `app/` - File-based routing (Expo Router)
  - `(tabs)/` - Tab-based screens (index.tsx, explore.tsx)
  - `_layout.tsx` - Root layout with theme provider
  - `+not-found.tsx` - 404 page
- `components/` - Reusable React components
  - `ui/` - UI-specific components (TabBarBackground, IconSymbol)
  - Themed components (ThemedView, ThemedText) for dark/light mode support
- `hooks/` - Custom React hooks for theming and color scheme
- `constants/` - App constants (Colors, etc.)
- `assets/` - Images, fonts, and other static assets

## Key Architectural Patterns

- **Theming System**: Uses `useColorScheme()` and `useThemeColor()` hooks with ThemedView/ThemedText components for automatic dark/light mode support
- **File-based Routing**: Expo Router handles navigation based on file structure in `app/` directory
- **Tab Navigation**: Bottom tab interface using React Navigation with haptic feedback
- **Path Aliases**: Uses `@/*` alias for imports (defined in tsconfig.json)

## Configuration

- **TypeScript**: Strict mode enabled, extends Expo's base config
- **ESLint**: Uses `eslint-config-expo` with flat config format
- **Expo Config**: Supports new architecture, typed routes, edge-to-edge on Android
- **Platform Support**: iOS (with tablet support), Android (adaptive icons), and web (static output)

## Development Notes

- Uses React 19.0.0 with React Native 0.79.6
- Font loading: SpaceMono font is loaded asynchronously in development
- Platform-specific implementations available (e.g., IconSymbol.ios.tsx)
- Haptic feedback integrated in tab navigation