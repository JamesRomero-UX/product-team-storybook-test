import type { QueryConfig } from '../db';

/**
 * Query configuration for user roles
 */
export const getUserRolesQueryConfig = {
  columns: {
    Id: true,
    OrgKey: true,
    ModifiedByUser: true,
    ModifiedAtTimestamp: true,
    UserId: true,
    RoleKey: true,
    CreatedAtTimestamp: true,
    CreatedByUser: true,
  },
  with: {
    role_type: {
      columns: {
        RoleKey: true,
        Name: true,
        RiskSmartInternal: true,
        TopLevelRoleKey: true,
        InstanceRoleKey: true,
        Description: true,
      },
      with: {
        resourceTypes: {
          columns: {
            RoleKey: true,
            ResourceType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'user_role'>;
