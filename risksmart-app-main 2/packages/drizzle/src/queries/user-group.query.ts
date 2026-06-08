import type { QueryConfig } from '../db';

/**
 * Query configuration for user groups
 */
export const getUserGroupsQueryConfig = {
  columns: {
    Id: true,
    OrgKey: true,
    Name: true,
    Description: true,
  },
} as const satisfies QueryConfig<'user_group'>;

/**
 * Query configuration for fetching a single user group by ID
 * Includes all fields needed for the user group detail view
 */
export const getUserGroupByIdQueryConfig = {
  columns: {
    Id: true,
    Name: true,
    Description: true,
    Email: true,
    OwnerContributor: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
  },
  with: {
    approvers: true,
  },
} as const satisfies QueryConfig<'user_group'>;

/**
 * Query configuration for fetching users belonging to a user group by group ID
 */
export const getUsersByGroupIdQueryConfig = {
  columns: {},
  with: {
    users: {
      columns: {
        CreatedAtTimestamp: true,
      },
      with: {
        authUsers: {
          with: {
            organisationusers: {
              columns: {
                Status: true,
              },
            },
          },
        },
        createdByUser: {
          columns: {
            FriendlyName: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'user_group'>;

/**
 * Query configuration for fetching all user groups with user and approver aggregate counts
 */
export const getUserGroupsWithApproversQueryConfig = {
  columns: {
    Id: true,
    Name: true,
    Email: true,
    Description: true,
    OwnerContributor: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
    OrgKey: true,
  },
  with: {
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    users: {
      columns: {
        UserId: true,
      },
    },
    approvers: {
      columns: {
        Id: true,
      },
    },
  },
} as const satisfies QueryConfig<'user_group'>;

/**
 * Query configuration for user group users
 */
export const getUserGroupUsersQueryConfig = {
  columns: {
    OrgKey: true,
    UserGroupId: true,
    UserId: true,
  },
} as const satisfies QueryConfig<'user_group_user'>;
