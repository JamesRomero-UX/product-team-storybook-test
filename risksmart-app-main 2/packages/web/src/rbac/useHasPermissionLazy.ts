import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type {
  Access_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { hasPermission } from './hasPermission';
import type {
  HasPermission,
  ObjectAccess,
  ObjectWithContributors,
} from './Permission';
import { useRoleAccess } from './useRoleAccess';

export const useHasPermissionLazy = (): HasPermission => {
  const { user } = useRisksmartUser();

  const roleAccess = useRoleAccess();

  return (
    permission: ObjectAccess | ObjectAccess[],
    parentObject?: null | ObjectWithContributors,
    canHaveAccessAsContributor?: boolean
  ) => {
    const permissionArray = Array.isArray(permission)
      ? permission
      : [permission];
    const parsed = permissionArray.map((p) => p.split(':'));

    if (parsed.some((p) => p.length !== 2)) {
      throw new Error('Invalid permission');
    }

    if (!roleAccess) {
      return {
        hasPermission: false,
        loading: false,
      };
    }

    return {
      hasPermission: parsed.some(([accessType, objectType]) => {
        return hasPermission({
          parentObject,
          userId: user?.userId,
          roleAccess,
          objectType: objectType as Parent_Type_Enum,
          accessType: accessType as Access_Type_Enum,
          canHaveAccessAsContributor,
        });
      }),
      loading: false,
    };
  };
};
