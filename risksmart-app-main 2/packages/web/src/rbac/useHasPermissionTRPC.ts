import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { Access_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from 'src/utils/trpc';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { type HasPermission } from './Permission';

export const useHasPermissionQuery: HasPermission = (
  permission,
  parentObject
) => {
  const permissionArray = Array.isArray(permission) ? permission : [permission];
  const parsed = permissionArray.map((p) => p.split(':'));
  if (parsed.some((p) => p.length !== 2)) {
    throw new Error('Invalid permission');
  }

  const trpcEnabled = useIsFeatureFlagEnabled('trpc');

  const { user } = useRisksmartUser();

  const permissionsToCheck = [];
  for (const element of parsed) {
    const [accessType, objectType] = element;
    if (!objectType || !accessType) {
      continue;
    }

    permissionsToCheck.push({
      resourceName: getResourceType(
        objectType as Parent_Type_Enum,
        !!parentObject
      ),
      resourceId: parentObject ? parentObject.Id : undefined,
      action: accessType as Access_Type_Enum,
      rootResourceCheck: isRootEntityCheck(objectType as Parent_Type_Enum),
    });
  }
  const trpc = useTRPC();
  const {
    data: trpcData,
    error: trpcError,
    isLoading,
  } = useQuery({
    ...trpc.frontend.permission.bulkCheck.queryOptions(permissionsToCheck),
    enabled: trpcEnabled, // Only enable TRPC query when flag is true
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
  });
  if (trpcError) {
    console.error('TRPC permission check error', {
      userId: user?.userId,
      error: trpcError,
    });

    return {
      hasPermission: false,
      loading: false,
    };
  }

  return {
    hasPermission: (trpcData?.length ?? 0) > 0,
    loading: isLoading,
  };
};

const isRootEntityCheck = (objectType: Parent_Type_Enum) => {
  return objectType === Parent_Type_Enum.RiskTier_1;
};

const getResourceType = (
  objectType: Parent_Type_Enum,
  instanceCheck: boolean
): string => {
  if (objectType === Parent_Type_Enum.RiskTier_1) {
    return Parent_Type_Enum.Risk as string;
  }

  if (!instanceCheck) {
    return objectType as string;
  }

  if (
    !(
      [
        Parent_Type_Enum.Audit,
        Parent_Type_Enum.DataExport,
        Parent_Type_Enum.DataImport,
        Parent_Type_Enum.CustomRibbon,
        Parent_Type_Enum.CustomRole,
        Parent_Type_Enum.ScimConfiguration,
        Parent_Type_Enum.Settings,
        Parent_Type_Enum.SettingsApprovals,
        Parent_Type_Enum.SettingsAudit,
        Parent_Type_Enum.SettingsDepartments,
        Parent_Type_Enum.SettingsTags,
        Parent_Type_Enum.SettingsUsers,
        Parent_Type_Enum.SettingsUserGroups,
        Parent_Type_Enum.OrganisationDashboard,
        Parent_Type_Enum.OrganisationTabPreference,
        Parent_Type_Enum.Taxonomy,
      ] as Parent_Type_Enum[]
    ).includes(objectType)
  ) {
    return 'rs_node';
  }

  return objectType as string;
};
