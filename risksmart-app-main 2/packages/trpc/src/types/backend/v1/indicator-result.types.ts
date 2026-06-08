import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIndicatorResultByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type IndicatorResultListResponseRow = InferQueryModel<
  'indicator_result',
  typeof getIndicatorResultByIdQueryConfig
>;

export interface IndicatorResultByIdResponse {
  indicatorResult: IndicatorResultListResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
