import type { QueryConfig } from '../db';

/**
 * Query configuration for owners
 */
export const getOwnersQueryConfig = {
  columns: {
    OrgKey: true,
    UserId: true,
    ParentId: true,
    CreatedAtTimestamp: true,
    CreatedByUser: true,
    ModifiedByUser: true,
    ModifiedAtTimestamp: true,
  },
  with: {
    parentNode: {
      columns: {
        OrgKey: true,
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
  },
} as const satisfies QueryConfig<'owner'>;

/**
 * Query configuration for owner groups
 */
export const getOwnerGroupsQueryConfig = {
  columns: {
    OrgKey: true,
    UserGroupId: true,
  },
  with: {
    parentNode: {
      columns: {
        Id: true,
        OrgKey: true,
        ObjectType: true,
      },
    },
  },
} as const satisfies QueryConfig<'owner_group'>;
