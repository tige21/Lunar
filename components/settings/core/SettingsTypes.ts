export interface SettingsCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  type: 'toggle' | 'slider' | 'picker' | 'button' | 'navigation' | 'info';
  value?: any;
  options?: SettingsPickerOption[];
  range?: [number, number];
  unit?: string;
  disabled?: boolean;
  variant?: 'default' | 'sleep' | 'ai' | 'privacy' | 'premium';
  onValueChange?: (value: any) => void;
  onPress?: () => void;
  children?: React.ReactNode;
}

export interface SettingsPickerOption {
  value: any;
  label: string;
  description?: string;
  icon?: string;
  premium?: boolean;
}

export interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  expanded?: boolean;
  collapsible?: boolean;
  variant?: 'default' | 'sleep' | 'ai' | 'premium';
  children: React.ReactNode;
  onToggleExpand?: (expanded: boolean) => void;
}

export interface SettingsScreenState {
  searchQuery: string;
  expandedSections: Set<string>;
  animationStates: Map<string, 'idle' | 'entering' | 'exiting'>;
  scrollPosition: number;
}

export interface AnimationPreset {
  duration: number;
  easing: any;
  useNativeDriver: boolean;
  delay?: number;
}

export interface SettingsTheme {
  colors: {
    cardBackground: string;
    cardBackgroundHover: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    gradient: string[];
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  elevation: {
    low: number;
    medium: number;
    high: number;
  };
}

export type SettingsUpdatePayload = {
  section: string;
  key: string;
  value: any;
  timestamp: number;
  source: 'user' | 'system' | 'sync';
};