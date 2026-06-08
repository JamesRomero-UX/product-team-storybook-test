import type { ParentType } from '@risksmart-app/domain/src/types/consts';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

/**
 * Hook to check if the current user can update form configuration for a given parent type.
 *
 * Uses RBAC-based permission checking via Permit.io: returns true if the user has a
 * Manager role (e.g., RiskManager, ControlManager) with update permission for the
 * form configuration resource associated with the parent type.
 *
 * This is tRPC-only (no GraphQL equivalent) as form configuration management is
 * part of the v3 tRPC migration.
 *
 * @param parentType - The ParentType to check form config access for
 * @returns Object with `canManage` boolean and `loading` state
 */
export const useCanManageFormConfig = (parentType: ParentType) => {
  const trpc = useTRPC();
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');

  const { data: canManage = false, isLoading } = useQuery({
    ...trpc.frontend.formConfiguration.canUpdateFormConfig.queryOptions({
      resourceType: parentType,
    }),
    enabled: !!parentType && trpcEnabled, // Only run query if we have a valid resource type and tRPC is enabled
  });

  return { canManage, loading: isLoading };
};
