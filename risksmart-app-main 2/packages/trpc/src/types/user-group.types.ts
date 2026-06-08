import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getUserGroupByIdQueryConfig,
  getUserGroupsWithApproversQueryConfig,
  getUsersByGroupIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user-group.query';

export type GetUsersByGroupIdResponseRow = InferQueryModel<
  'user_group',
  typeof getUsersByGroupIdQueryConfig
>;

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

export type GetUserGroupsWithApproversResponseRow = InferQueryModel<
  'user_group',
  typeof getUserGroupsWithApproversQueryConfig
> & {
  users_aggregate: { aggregate: { count: number } };
  approvers_aggregate: { aggregate: { count: number } };
};
