import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type {
  Access_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { hasPermission } from './hasPermission';
import { type HasPermission } from './Permission';
import { useHasPermissionQuery as useHasPermissionTRPC } from './useHasPermissionTRPC';
import { useRoleAccess } from './useRoleAccess';

export const useHasPermissionQuery: HasPermission = (
  permission,
  parentObject,
  canHaveAccessAsContributor
) => {
  const permissionArray = Array.isArray(permission) ? permission : [permission];
  const parsed = permissionArray.map((p) => p.split(':'));

  if (parsed.some((p) => p.length !== 2)) {
    throw new Error('Invalid permission');
  }

  const { user } = useRisksmartUser();
  const roleAccess = useRoleAccess();
  const trpcEnabled = useIsFeatureFlagEnabled('trpc');
  const trpcResult = useHasPermissionTRPC(
    permission,
    parentObject,
    canHaveAccessAsContributor
  );

  const nonTRPCPermitted = parsed.some(([accessType, objectType]) => {
    return hasPermission({
      parentObject,
      userId: user?.userId,
      roleAccess,
      objectType: objectType as Parent_Type_Enum,
      accessType: accessType as Access_Type_Enum,
      canHaveAccessAsContributor,
    });
  });

  if (!roleAccess) {
    return {
      hasPermission: false,
      loading: false,
    };
  }

  if (trpcEnabled) {
    return trpcResult;
  }

  return {
    hasPermission: nonTRPCPermitted,
    loading: false,
  };
};
