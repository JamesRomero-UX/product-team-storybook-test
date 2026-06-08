import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getRiskItemQueryConfig,
  getRiskListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/risk.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

type RiskByIdResponseItem = InferQueryModel<
  'risk',
  typeof getRiskItemQueryConfig
>;

export type RiskListResponseRow = InferQueryModel<
  'risk',
  typeof getRiskListQueryConfig
>;
export interface RiskByIdResponse {
  risk: RiskByIdResponseItem;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
