import { randomUUID } from 'crypto';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import { InternalServerError } from 'http-errors';
import { getLogger } from 'src/logger';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';

interface JiraRiskAssessmentResult {
  riskId: string;
  impact?: number;
  likelihood?: number;
  rating?: number;
}

const logger = getLogger();

/**
 * Adds a risk assessment result for a given risk.
 * @param apiClient - The API client to interact with the backend.
 * @param riskId - The ID of the risk to add the assessment result for.
 * @returns A promise that resolves when the assessment result is added.
 */
export const addRiskAssessmentResult = async (
  apiClient: Sdk,
  jiraRiskAssessmentResult: JiraRiskAssessmentResult
) => {
  const { riskId, impact, likelihood, rating } = jiraRiskAssessmentResult;
  if (
    impact === undefined ||
    likelihood === undefined ||
    rating === undefined
  ) {
    logger.info(
      'Impact, likelihood, or rating not provided, skipping risk assessment result creation',
      { jiraRiskAssessmentResult }
    );

    return;
  }

  logger.info('Adding risk assessment result for risk', { riskId });
  const id = randomUUID();
  const result = await apiClient.insertRiskAssessmentResults({
    results: {
      Id: id,
      TestDate: new Date().toISOString(),
      Impact: impact,
      Likelihood: likelihood,
      ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
      Rating: rating,
      parents: {
        data: [
          {
            ParentId: riskId,
            ParentType: ParentTypeEnum.Risk,
            ResultType: ParentTypeEnum.RiskAssessmentResult,
          },
        ],
      },
    },
  });

  if (!result || result.insert_risk_assessment_result?.affected_rows === 0) {
    throw new InternalServerError(
      'Failed to insert risk assessment result for risk'
    );
  }

  logger.info('Risk assessment result added successfully', { resultId: id });
};
