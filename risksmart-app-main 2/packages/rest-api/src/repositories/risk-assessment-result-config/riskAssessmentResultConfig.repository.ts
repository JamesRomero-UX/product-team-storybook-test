import {
  type RiskAssessmentResultConfig,
  RiskAssessmentResultConfigSchema,
} from 'src/handlers/risk-assessment-result-config/schema';

import { getBackendRestApiClient } from '../getBackendRestApiClient';
import type { RepositoryOptions } from '../types';

export const RiskAssessmentResultConfigRepository = (
  options: RepositoryOptions
) => {
  const client = getBackendRestApiClient(options);

  return {
    async getLatest(): Promise<RiskAssessmentResultConfig | undefined> {
      const result = await client.getLatestRiskAssessmentResultConfig();
      const config = result.risk_assessment_result_config[0]?.Config;

      if (!config) {
        return undefined;
      }

      return RiskAssessmentResultConfigSchema.parse(config);
    },
  };
};
