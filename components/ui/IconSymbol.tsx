// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Original mappings
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  
  // Sleep and moon icons
  'moon.stars.fill': 'bedtime',
  'moon.fill': 'nightlight',
  'moon.zzz.fill': 'hotel',
  
  // User and profile
  'person.circle.fill': 'account-circle',
  
  // Status and feedback
  'exclamationmark.triangle.fill': 'warning',
  'arrow.up.right': 'trending-up',
  'flame.fill': 'local-fire-department',
  
  // Charts and data
  'chart.bar.doc.horizontal': 'assessment',
  'chart.line.uptrend.xyaxis': 'trending-up',
  
  // Communication
  'message.fill': 'message',
  'message.badge.fill': 'chat',
  'bubble.left.fill': 'chat-bubble',
  'bubble.right.fill': 'chat-bubble-outline',
  
  // Time and tracking
  'timer': 'timer',
  'clock.fill': 'access-time',
  'eye.slash.fill': 'visibility-off',
  
  // Tab bar icons
  'chart.bar.fill': 'bar-chart',
  'star.fill': 'star',
  'gear': 'settings',
  
  // Health and fitness icons
  'heart.fill': 'favorite',
  'figure.walk': 'directions-walk',
  'activity': 'fitness-center',
  'waveform.path.ecg': 'monitor-heart',
  
  // Permission and security icons
  'lock.shield': 'security',
  'checkmark.shield.fill': 'verified-user',
  'hand.raised.fill': 'pan-tool',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
