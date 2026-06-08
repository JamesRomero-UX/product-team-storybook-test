import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getEntityByIdQueryConfig,
  getEntityRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/entity.query';

export type EntityRegisterResponseRow = InferQueryModel<
  'entity',
  typeof getEntityRegisterQueryConfig
>;

export interface EntityRegisterResponse {
  entity: EntityRegisterResponseRow[];
}

export type EntityByIdResponse = InferQueryModel<
  'entity',
  typeof getEntityByIdQueryConfig
> | null;
