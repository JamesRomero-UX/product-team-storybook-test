import type { ModuleKey } from '@risksmart-app/modules/src/index';
import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import { useCallback } from 'react';
import { useModulesStore } from 'src/context/moduleContext';
import { useFeatures } from 'src/rbac/useFeatures';

/**
 * Hook to check if a module is enabled for the current organisation.
 * Uses the module tree when the modules system is active, falls back
 * to pre-modules defaults when it is not.
 *
 * @param moduleKey Dot-notation module path, e.g. 'risk.subModules.appetite'
 */
export const useIsModuleEnabled = (moduleKey: ModuleKey): boolean => {
  const { modules } = useModulesStore();
  const features = useFeatures();
  const modulesSystemActive = features.includes('modules');

  return resolveModuleEnabled({
    modules,
    moduleKey,
    modulesSystemActive,
    features,
  });
};

/**
 * Lazy variant that returns a callback for checking module enablement.
 * Useful when you need to check multiple module keys or pass the check
 * as a callback.
 */
export const useIsModuleEnabledLazy = (): ((
  moduleKey: ModuleKey
) => boolean) => {
  const { modules } = useModulesStore();
  const features = useFeatures();
  const modulesSystemActive = features.includes('modules');

  return useCallback(
    (moduleKey: ModuleKey) =>
      resolveModuleEnabled({
        modules,
        moduleKey,
        modulesSystemActive,
        features,
      }),
    [modules, modulesSystemActive, features]
  );
};
