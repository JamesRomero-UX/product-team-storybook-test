import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import { useMemo } from 'react';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

/**
 * Hook to determine if entity labels should be shown in risk selectors
 *
 * Entity labels should be shown when:
 * 1. Entities feature is enabled for the organization (enterprise_risk feature)
 * 2. There are multiple entities available (not just a single entity context)
 * 3. Explicitly enabled via prop override
 */
export const useEntityLabelsFeature = (explicitOverride?: boolean) => {
  const { entityIds } = useEntityFilter();
  const entitiesEnabled = useIsModuleEnabled('enterprise_risk');

  const shouldShowEntityLabels = useMemo(() => {
    // Explicit prop override takes precedence
    if (explicitOverride !== undefined) {
      return explicitOverride;
    }

    // Show labels when entities feature is enabled AND we have a multi-entity context
    // Multi-entity context means either no filter (showing all) or multiple entities
    const hasMultipleEntities = entityIds.length !== 1;

    return entitiesEnabled && hasMultipleEntities;
  }, [entitiesEnabled, entityIds.length, explicitOverride]);

  return {
    shouldShowEntityLabels,
    entitiesEnabled,
    hasEntityFilter: entityIds.length > 0,
    isMultiEntityContext: entityIds.length !== 1,
    entityFilterCount: entityIds.length,
  };
};
