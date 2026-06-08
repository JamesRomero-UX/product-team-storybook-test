import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getActiveAppetitesByParentIdQueryConfig,
  getAppetiteByIdQueryConfig,
  getAppetiteParentRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/appetite.query';

export type AppetiteParentRegisterResponseRow = InferQueryModel<
  'appetite_parent',
  typeof getAppetiteParentRegisterQueryConfig
>;

export type AppetiteByIdResponseRow = InferQueryModel<
  'appetite',
  typeof getAppetiteByIdQueryConfig
>;

export type GetActiveAppetitesByParentIdResponseRow = InferQueryModel<
  'appetite_parent',
  typeof getActiveAppetitesByParentIdQueryConfig
>;

export interface CreateAppetiteResponse {
  Id: string;
}

export interface UpdateAppetiteResponse {
  Id: string;
}
