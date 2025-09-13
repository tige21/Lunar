export interface DemoMessage {
  text: string;
  isUser: boolean;
  type: 'text' | 'insight' | 'recommendation';
}

export interface LocalizedMessages {
  en: DemoMessage[];
  ru: DemoMessage[];
}

export interface ChatDemoProps {
  onNext?: () => void;
  language: 'en' | 'ru';
}

export interface LunaAvatarProps {
  colorScheme: 'light' | 'dark' | null;
}

export interface AiChatHeaderProps {
  language: 'en' | 'ru';
}

export interface FeatureCardProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  colorScheme: 'light' | 'dark' | null;
}

export interface TrustCardProps {
  language: 'en' | 'ru';
  colorScheme: 'light' | 'dark' | null;
}

export interface TimingConfig {
  baseDelay: {
    text: number;
    insight: number;
    recommendation: number;
  };
  typingSpeed: number; // ms per character
  minTypingTime: number;
  maxTypingTime: number;
  postInsightDelay: number;
}