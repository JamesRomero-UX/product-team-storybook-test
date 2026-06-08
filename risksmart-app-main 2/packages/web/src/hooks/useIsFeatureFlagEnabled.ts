import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { FeatureFlag } from '@risksmart-app/modules/src/index';
import { useCallback } from 'react';
import { useFeatures } from 'src/rbac/useFeatures';

/**
 * Hook to check if a feature flag (non-module-backed) is enabled.
 * These are for in-progress work controlled via the org features array
 * or environment variables.
 */
export const useIsFeatureFlagEnabled = (flag: FeatureFlag): boolean => {
  const features = useFeatures();

  return (
    features.includes(flag) ||
    getEnv(`REACT_APP_FEATURE_${flag}`, true) === 'true'
  );
};

/**
 * Lazy variant that returns a callback for checking feature flags.
 * Useful when you need to check multiple flags or pass the check
 * as a callback.
 */
export const useIsFeatureFlagEnabledLazy = (): ((
  flag: FeatureFlag
) => boolean) => {
  const features = useFeatures();

  return useCallback(
    (flag: FeatureFlag) =>
      features.includes(flag) ||
      getEnv(`REACT_APP_FEATURE_${flag}`, true) === 'true',
    [features]
  );
};
