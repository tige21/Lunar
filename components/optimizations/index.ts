export { default as LazyAnimation, withLazyAnimation, useLazyAnimation } from './LazyAnimation';
export { 
  default as LazyComponent, 
  withLazyLoading, 
  useLazyComponent,
  LazyOnboardingScreen,
  LazyAnalyticsChart,
  LazyChatComponent
} from './LazyComponent';

// Direct re-export to avoid issues
export { default } from './LazyComponent';