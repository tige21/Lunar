export interface NotificationsScreenProps {
  onNext?: () => void;
}

export interface NotificationsHeaderProps {
  language: 'en' | 'ru';
  tintColor: string;
}

export interface NotificationsBenefitsProps {
  language: 'en' | 'ru';
  surfaceColor: string;
}

export interface NotificationsPrivacyProps {
  language: 'en' | 'ru';
}

export interface NotificationsActionsProps {
  language: 'en' | 'ru';
  isRequesting: boolean;
  onEnableNotifications: () => void;
  onSkip: () => void;
}