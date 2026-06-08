import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getUserGroupByIdQueryConfig,
  getUserGroupsWithApproversQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user-group.query';

export type UserGroupListResponseRow = InferQueryModel<
  'user_group',
  typeof getUserGroupsWithApproversQueryConfig
>;

export type UserGroupByIdResponseRow = InferQueryModel<
  'user_group',
  typeof getUserGroupByIdQueryConfig
>;

export interface UserGroupByIdResponse {
  userGroup: UserGroupByIdResponseRow;
  form_configuration: null;
}
