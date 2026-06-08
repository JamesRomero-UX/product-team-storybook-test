import { BadRequest, InternalServerError } from 'http-errors';
import { RiskAssessmentResultConfigRepository } from 'src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository';
import type { SessionData } from 'src/session';

import type { RiskAssessmentResultImpact } from './schema';

const calculateAverageImpact = (
  impacts: RiskAssessmentResultImpact[]
): number => {
  const impactTotal = impacts.reduce(
    (total, impact) => total + impact.Value,
    0
  );

  return Math.round(impactTotal / impacts.length);
};

const calculateMaximumImpact = (
  impacts: RiskAssessmentResultImpact[]
): number => {
  const maxImpact = impacts.reduce(
    (max, impact) => (impact.Value > max ? impact.Value : max),
    0
  );

  return maxImpact;
};

export const calculateImpact = async (
  sessionData: SessionData,
  impacts: RiskAssessmentResultImpact[]
): Promise<number> => {
  const repository = RiskAssessmentResultConfigRepository(sessionData);
  const config = await repository.getLatest();

  if (!config) {
    throw new InternalServerError(
      'Failed to retrieve risk assessment result configuration'
    );
  }

  if (config.impact.categories.length === 0) {
    if (impacts.length !== 1) {
      throw new BadRequest(
        `Expected 1 impact for single-impact configuration, received ${impacts.length}`
      );
    }

    return impacts[0]!.Value;
  }

  if (impacts.length !== config.impact.categories.length) {
    throw new BadRequest(
      `Expected ${config.impact.categories.length} impacts to match configured categories, received ${impacts.length}`
    );
  }

  if (config.impact.aggregation === 'average') {
    return calculateAverageImpact(impacts);
  }

  if (config.impact.aggregation === 'maximum') {
    return calculateMaximumImpact(impacts);
  }

  throw new InternalServerError(
    'Unrecognised impact aggregation method configured'
  );
};
