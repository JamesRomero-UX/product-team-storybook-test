import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getObligationByIdQueryConfig,
  getObligationRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/obligation.query';

export type ObligationRegisterResponseRow = InferQueryModel<
  'obligation',
  typeof getObligationRegisterQueryConfig
>;

export type GetObligationByIdResponseRow = InferQueryModel<
  'obligation',
  typeof getObligationByIdQueryConfig
>;

export interface CreateObligationResponse {
  Id: string;
}
