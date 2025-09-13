export interface WelcomeScreenProps {
  onNext?: () => void;
}

export interface WelcomeHeroProps {
  language: 'en' | 'ru';
  primaryColor: string;
  pulseScale: any;
  logoScale: any;
  titleOpacity: any;
  contentOpacity: any;
}

export interface WelcomeVisualProps {
  primaryColor: string;
  waveOpacity: any;
}

export interface WelcomeFeaturesProps {
  language: 'en' | 'ru';
  primaryColor: string;
  featureOpacity: any;
}

export interface WelcomeActionProps {
  language: 'en' | 'ru';
  onNext?: () => void;
  buttonOpacity: any;
  buttonTranslateY: any;
}