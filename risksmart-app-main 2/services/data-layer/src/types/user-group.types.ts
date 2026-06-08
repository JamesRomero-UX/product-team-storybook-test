import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getUserGroupByIdQueryConfig,
  getUserGroupsQueryConfig,
  getUserGroupsWithApproversQueryConfig,
  getUserGroupUsersQueryConfig,
  getUsersByGroupIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user-group.query';

export type UserGroupRow = InferQueryModel<
  'user_group',
  typeof getUserGroupsQueryConfig
>;

export type UserGroupUserRow = InferQueryModel<
  'user_group_user',
  typeof getUserGroupUsersQueryConfig
>;

export type GetUsersByGroupIdResponseRow = InferQueryModel<
  'user_group',
  typeof getUsersByGroupIdQueryConfig
>;

/**
 * Response type for GET /user-groups/{id}
 * Includes the approvers_aggregate structure to match Hasura response format
 */
export type GetUserGroupByIdResponseRow = InferQueryModel<
  'user_group',
  typeof getUserGroupByIdQueryConfig
> & {
  approvers_aggregate: {
    aggregate: {
      count: number;
    };
  };
};

/**
 * Response type for GET /user-groups
 * Replaces raw users/approvers arrays from query with aggregate counts to match Hasura response format
 */
export type GetUserGroupsWithApproversResponseRow = Omit<
  InferQueryModel<'user_group', typeof getUserGroupsWithApproversQueryConfig>,
  'usersCount' | 'approversCount'
> & {
  users_aggregate: { aggregate: { count: number } };
  approvers_aggregate: { aggregate: { count: number } };
};
