import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getUserByIdQueryConfig,
  getUserListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/user.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type GetUserByIdResponseRow = InferQueryModel<
  'user_view_active',
  typeof getUserByIdQueryConfig
>;

export type UserListResponseRow = InferQueryModel<
  'user_view_active',
  typeof getUserListQueryConfig
>;

export interface UserByIdResponse {
  user: GetUserByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
