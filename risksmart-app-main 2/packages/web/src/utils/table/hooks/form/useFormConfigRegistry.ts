import { createFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import { useMemo } from 'react';
import { useFeatures } from 'src/rbac/useFeatures';

/**
 * Returns the whole form config registry
 * @returns
 */
export const useFormConfigRegistry = () => {
  const enabledFeatures = useFeatures();

  return useMemo(
    () => createFormConfigRegistry(enabledFeatures),
    [enabledFeatures]
  );
};
