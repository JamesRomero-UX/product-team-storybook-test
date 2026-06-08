import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIndicatorListQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';
import type { GetIndicatorByIdResponseRow } from '../../indicator.types';

export type IndicatorListResponseRow = InferQueryModel<
  'indicator',
  typeof getIndicatorListQueryConfig
>;

export interface IndicatorByIdResponse {
  indicator: GetIndicatorByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
