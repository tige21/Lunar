export interface SleepGoals {
  sleepDuration: number; // hours
  bedtime: Date;
  wakeTime: Date;
  age?: number;
}

export interface SleepGoalsScreenProps {
  onNext?: (goals: SleepGoals) => void;
  initialGoals?: Partial<SleepGoals>;
}

export interface SleepGoalsHeaderProps {
  language: 'en' | 'ru';
  progressAnimatedStyle: any;
}

export interface AgeGroupSelectorProps {
  language: 'en' | 'ru';
  ageGroup: keyof typeof SLEEP_RECOMMENDATIONS;
  onAgeGroupChange: (age: keyof typeof SLEEP_RECOMMENDATIONS) => void;
  surfaceColor: string;
  borderColor: string;
  goalCardAnimatedStyle: any;
}

export interface SleepDurationSliderProps {
  language: 'en' | 'ru';
  sleepDuration: number;
  onSleepDurationChange: (duration: number) => void;
  tintColor: string;
  surfaceColor: string;
  borderColor: string;
  goalCardAnimatedStyle: any;
}

export interface TimeScheduleSelectorProps {
  language: 'en' | 'ru';
  bedtime: Date;
  wakeTime: Date;
  onBedtimeChange: (time: Date) => void;
  onWakeTimeChange: (time: Date) => void;
  actualSleepTime: number;
  getQualityColor: () => string;
  surfaceColor: string;
  borderColor: string;
  timePickerAnimatedStyle: any;
}

export interface SleepSchedulePreviewProps {
  language: 'en' | 'ru';
  bedtime: Date;
  wakeTime: Date;
  formatTime: (date: Date) => string;
  surfaceColor: string;
  borderColor: string;
  goalCardAnimatedStyle: any;
}

export interface ValidationFeedbackProps {
  language: 'en' | 'ru';
  validation: { valid: boolean; message: string };
  validationAnimatedStyle: any;
}

export interface SleepGoalsActionProps {
  language: 'en' | 'ru';
  onContinue: () => void;
}

// Age-based sleep recommendations (hours)
export const SLEEP_RECOMMENDATIONS = {
  '18-25': { min: 7, max: 9, optimal: 8 },
  '26-64': { min: 7, max: 9, optimal: 8 },
  '65+': { min: 7, max: 8, optimal: 7.5 },
} as const;