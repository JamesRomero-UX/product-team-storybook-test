import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getObligationChangeRegisterQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation-change.query';

export type ObligationChangeRegisterResponseRow = InferQueryModel<
  'obligation_change',
  typeof getObligationChangeRegisterQueryConfig
>;
