import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getObligationListQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';
import type { GetObligationByIdResponseRow } from '../../obligation.types';

export type ObligationListResponseRow = InferQueryModel<
  'obligation',
  typeof getObligationListQueryConfig
>;

export interface ObligationByIdResponse {
  obligation: GetObligationByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
