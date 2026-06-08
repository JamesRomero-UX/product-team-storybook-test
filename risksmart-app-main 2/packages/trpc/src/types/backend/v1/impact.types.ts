import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getImpactQueryConfig } from '@risksmart-app/drizzle/src/queries/impact.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ImpactResponseRow = InferQueryModel<
  'impact',
  typeof getImpactQueryConfig
>;

export interface ImpactByIdResponse {
  impact: ImpactResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
