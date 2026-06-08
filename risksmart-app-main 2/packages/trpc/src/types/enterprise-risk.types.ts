import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getEnterpriseRiskByIdQueryConfig,
  getEnterpriseRiskByTierQueryConfig,
  getEnterpriseRiskRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/enterprise-risk.query';

export type EnterpriseRiskRegisterResponseRow = InferQueryModel<
  'enterprise_risk',
  typeof getEnterpriseRiskRegisterQueryConfig
>;

export type EnterpriseRiskByIdResponseRow = InferQueryModel<
  'enterprise_risk',
  typeof getEnterpriseRiskByIdQueryConfig
>;

export type EnterpriseRiskByTierResponseRow = InferQueryModel<
  'enterprise_risk',
  typeof getEnterpriseRiskByTierQueryConfig
>;
