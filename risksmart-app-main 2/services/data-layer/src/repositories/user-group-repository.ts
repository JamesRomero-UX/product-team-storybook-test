import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getUserGroupByIdQueryConfig,
  getUserGroupsQueryConfig,
  getUserGroupsWithApproversQueryConfig,
  getUserGroupUsersQueryConfig,
  getUsersByGroupIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user-group.query';

import type {
  GetUserGroupByIdResponseRow,
  GetUserGroupsWithApproversResponseRow,
  GetUsersByGroupIdResponseRow,
  UserGroupRow,
  UserGroupUserRow,
} from '../types/user-group.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for user group data access
 */
export function createUserGroupRepository(db: DB['transaction']) {
  return {
    /**
     * Get a single user group by ID
     * Returns null if user group doesn't exist
     * Note: Permit.io filtering should be applied at the processor level
     */
    getById: async (
      userGroupId: string
    ): Promise<GetUserGroupByIdResponseRow | null> => {
      try {
        logger.info('Getting user group by ID', { userGroupId });

        const data = await db(async (tx) => {
          return tx.query.user_group.findMany({
            where: {
              Id: userGroupId,
            },
            ...getUserGroupByIdQueryConfig,
          });
        });

        if (data.length === 0) {
          logger.info('User group not found', { userGroupId });

          return null;
        }

        const result = data[0]!;

        return {
          ...result,
          approvers_aggregate: {
            aggregate: {
              count: result.approvers?.length ?? 0,
            },
          },
        };
      } catch (error) {
        logger.error('Failed to get user group by ID', {
          error,
          userGroupId,
        });
        throw error;
      }
    },

    /**
     * Get users belonging to a user group by group ID
     * Returns null if user group doesn't exist
     */
    getUsersByGroupId: async (
      groupId: string
    ): Promise<GetUsersByGroupIdResponseRow[] | null> => {
      try {
        logger.info('Getting users by group ID', { groupId });

        const data = await db(async (tx) => {
          return tx.query.user_group.findMany({
            where: {
              Id: groupId,
            },
            ...getUsersByGroupIdQueryConfig,
          });
        });

        if (data.length === 0) {
          logger.info('User group not found', { groupId });

          return null;
        }

        return data;
      } catch (error) {
        logger.error('Failed to get users by group ID', {
          error,
          groupId,
        });
        throw error;
      }
    },

    /**
     * Get all user groups with user and approver aggregate counts
     */
    getAllWithApprovers: async (): Promise<
      GetUserGroupsWithApproversResponseRow[]
    > => {
      try {
        const data = await db((tx) => {
          return tx.query.user_group.findMany({
            ...getUserGroupsWithApproversQueryConfig,
            orderBy: (table, { asc }) => asc(table.Name),
          });
        });

        return data.map((row) => {
          const { users, approvers } = row;

          return {
            ...row,
            users_aggregate: {
              aggregate: {
                count: users?.length ?? 0,
              },
            },
            approvers_aggregate: {
              aggregate: {
                count: approvers?.length ?? 0,
              },
            },
          };
        });
      } catch (error) {
        logger.error('Failed to query user groups with approvers', { error });
        throw error;
      }
    },

    /**
     * Get all user groups for an organization
     */
    getAll: async (orgKey: string): Promise<UserGroupRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.user_group.findMany({
            ...getUserGroupsQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query user groups', { error, orgKey });
        throw error;
      }
    },

    /**
     * Get all user group users for an organization
     */
    getAllUsers: async (orgKey: string): Promise<UserGroupUserRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.user_group_user.findMany({
            ...getUserGroupUsersQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query user group users', { error, orgKey });
        throw error;
      }
    },
  };
}
