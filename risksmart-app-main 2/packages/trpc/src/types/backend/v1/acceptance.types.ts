import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getAcceptanceListQueryConfig } from '@risksmart-app/drizzle/src/queries/acceptance.query';

import type { GetAcceptanceByIdResponseRow } from '../../acceptance.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type AcceptanceListResponseRow = InferQueryModel<
  'acceptance',
  typeof getAcceptanceListQueryConfig
>;

export interface AcceptanceByIdResponse {
  acceptance: GetAcceptanceByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
