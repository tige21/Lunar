import { ChronotypeResult } from './types';
import { messages } from './messages';

export function getChronotypeResult(score: number, language: 'en' | 'ru' = 'en'): ChronotypeResult {
  const msgs = messages[language];

  if (score <= -6) {
    return {
      type: 'morning',
      score,
      description: msgs.results.types.morning.description,
      recommendations: msgs.results.types.morning.recommendations
    };
  } else if (score >= 6) {
    return {
      type: 'evening',
      score,
      description: msgs.results.types.evening.description,
      recommendations: msgs.results.types.evening.recommendations
    };
  } else {
    return {
      type: 'neither',
      score,
      description: msgs.results.types.neither.description,
      recommendations: msgs.results.types.neither.recommendations
    };
  }
}

export function getResultTitle(type: 'morning' | 'evening' | 'neither', language: 'en' | 'ru' = 'en'): string {
  const msgs = messages[language];
  return msgs.results.types[type].title;
}

export function getResultEmoji(type: 'morning' | 'evening' | 'neither'): string {
  switch (type) {
    case 'morning':
      return '🌅';
    case 'evening':
      return '🌙';
    default:
      return '⚖️';
  }
}

export function formatProgressText(current: number, total: number, language: 'en' | 'ru' = 'en'): string {
  const msgs = messages[language];
  return msgs.progress.questionCounter
    .replace('{current}', current.toString())
    .replace('{total}', total.toString());
}