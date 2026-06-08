import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getUsersQueryConfig } from '@risksmart-app/drizzle/src/queries/user.query';

export type UserRow = InferQueryModel<'user', typeof getUsersQueryConfig>;
