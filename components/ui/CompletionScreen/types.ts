export interface CompletionScreenProps {
  onComplete?: () => void;
}

export interface CompletionSuccessProps {
  language: 'en' | 'ru';
  successScale: any;
  successOpacity: any;
  titleOpacity: any;
  contentOpacity: any;
}

export interface CompletionActionProps {
  language: 'en' | 'ru';
  onComplete?: () => void;
  buttonOpacity: any;
  buttonTranslateY: any;
}