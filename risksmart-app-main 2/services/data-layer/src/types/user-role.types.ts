import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getUserRolesQueryConfig } from '@risksmart-app/drizzle/src/queries/user-role.query';

export type UserRoleRow = InferQueryModel<
  'user_role',
  typeof getUserRolesQueryConfig
>;
