import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getRiskAssessmentResultQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-result.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type RiskAssessmentResultRow = InferQueryModel<
  'risk_assessment_result',
  typeof getRiskAssessmentResultQueryConfig
>;

export interface RiskAssessmentResultByIdResponse {
  riskAssessmentResult: RiskAssessmentResultRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
