export interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    value: number; // Points toward morning (negative) or evening (positive)
    emoji: string;
  }[];
}

export interface ChronotypeResult {
  type: 'morning' | 'evening' | 'neither';
  score: number;
  description: string;
  recommendations: string[];
}

export interface ChronotypeMessages {
  progress: {
    questionCounter: string; // "Question {current} of {total}"
  };
  questions: Question[];
  results: {
    types: {
      morning: {
        title: string;
        description: string;
        recommendations: string[];
      };
      evening: {
        title: string;
        description: string;
        recommendations: string[];
      };
      neither: {
        title: string;
        description: string;
        recommendations: string[];
      };
    };
    recommendationsTitle: string;
    continueButton: string;
  };
}

export interface ChronotypeScreenProps {
  onNext?: (chronotype: ChronotypeResult) => void;
  language?: 'en' | 'ru';
}