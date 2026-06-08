import type { OrgFeature } from '@risksmart-app/modules/src/index';
import { useContext } from 'react';

import { FeaturesContext } from './FeaturesContext';

/**
 * Returns the raw org features array from the DB. Prefer the purpose-built
 * hooks over using this directly:
 *
 * - **Module checks** → `useIsModuleEnabled` / `useIsModuleEnabledLazy`
 * - **Feature flag checks** → `useIsFeatureFlagEnabled` / `useIsFeatureFlagEnabledLazy`
 *
 * Direct usage of `features.includes('someFeature')` bypasses the module
 * resolution logic and won't work correctly for module-backed features.
 */
export const useFeatures = (): OrgFeature[] => {
  const context = useContext(FeaturesContext);
  if (context === null) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }

  return context;
};
