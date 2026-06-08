import type {
  InferQueryModel,
  InferSelectModel,
} from '@risksmart-app/drizzle/src/db';
import type { getObligationImpactsByParentIdQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation-impact.query';

export type GetObligationImpactsByParentIdResponseRow = InferQueryModel<
  'obligation_impact',
  typeof getObligationImpactsByParentIdQueryConfig
>;

export type CreateObligationImpactResponse =
  InferSelectModel<'obligation_impact'>;
