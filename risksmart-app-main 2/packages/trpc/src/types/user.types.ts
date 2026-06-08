import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getUserQueryConfig } from '@risksmart-app/drizzle/src/queries/user.query';

export type UserResponseRow = InferQueryModel<
  'user_view_active',
  typeof getUserQueryConfig
>;
