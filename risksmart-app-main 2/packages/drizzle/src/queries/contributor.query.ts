import type { QueryConfig } from '../db';

/**
 * Query configuration for contributors
 */
export const getContributorsQueryConfig = {
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
} as const satisfies QueryConfig<'contributor'>;

/**
 * Query configuration for contributor groups
 */
export const getContributorGroupsQueryConfig = {
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
} as const satisfies QueryConfig<'contributor_group'>;
