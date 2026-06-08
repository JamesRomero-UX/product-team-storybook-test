import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getEnterpriseRiskByIdQueryConfig,
  getEnterpriseRiskListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/enterprise-risk.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type EnterpriseRiskListResponseRow = InferQueryModel<
  'enterprise_risk',
  typeof getEnterpriseRiskListQueryConfig
>;

export type GetEnterpriseRiskByIdResponseRow = InferQueryModel<
  'enterprise_risk',
  typeof getEnterpriseRiskByIdQueryConfig
>;

export interface EnterpriseRiskByIdResponse {
  enterprise_risk: GetEnterpriseRiskByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
export interface BackendEnterpriseRiskByIdResponse {
  enterpriseRisk: GetEnterpriseRiskByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
