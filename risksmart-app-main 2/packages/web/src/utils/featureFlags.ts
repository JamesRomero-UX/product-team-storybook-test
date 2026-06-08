import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { FeatureFlag } from '@risksmart-app/modules/src/index';

export type FeatureFlagKey = `REACT_APP_FEATURE_${FeatureFlag}`;

export const isFeatureEnabled = (flag: FeatureFlagKey) => {
  return getEnv(flag, true) === 'true';
};
