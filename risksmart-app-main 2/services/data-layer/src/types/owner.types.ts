import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getOwnerGroupsQueryConfig,
  getOwnersQueryConfig,
} from '@risksmart-app/drizzle/src/queries/owner.query';

export type OwnerRow = InferQueryModel<'owner', typeof getOwnersQueryConfig>;

export type OwnerGroupRow = InferQueryModel<
  'owner_group',
  typeof getOwnerGroupsQueryConfig
>;
