export interface BenefitsScreenProps {
  onNext?: () => void;
}

export interface BenefitsHeaderProps {
  language: 'en' | 'ru';
  headerOpacity: any;
}

export interface BenefitCardProps {
  language: 'en' | 'ru';
  icon: string;
  titleKey: string;
  descKey: string;
  color: string;
  delay?: number;
}

export interface BenefitGridProps {
  language: 'en' | 'ru';
  contentOpacity: any;
}

export interface BenefitsTrustProps {
  language: 'en' | 'ru';
  contentOpacity: any;
}

export interface BenefitsActionProps {
  language: 'en' | 'ru';
  onNext?: () => void;
  buttonOpacity: any;
  buttonTranslateY: any;
}