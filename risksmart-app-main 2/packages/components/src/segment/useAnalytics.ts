import { useAmplitude } from './useAmplitude.hook';
import { useSegment } from './useSegment.hook';

// Create an analytics hook that provides access to both services
export const useAnalytics = () => {
  const segment = useSegment();
  const amplitude = useAmplitude();

  return {
    segment,
    amplitude,
  };
};

// Re-export individual hooks for convenience
export { useAmplitude } from './useAmplitude.hook';
export { useSegment } from './useSegment.hook';
