import {
  GetRiskAssessmentResultConfigByIdDocument,
  UpdateRiskAssessmentResultConfigDocument,
} from 'generated/graphql';
import { BadRequest, NotFound } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';

import {
  PutRiskAssessmentResultConfigSchema,
  type RiskAssessmentResultConfig,
} from './schema';

export const handler = backendRouteHandler(
  PutRiskAssessmentResultConfigSchema,
  async (request) => {
    const hasuraClient = getHasuraBackendClientForAction(request);
    const { Id, Config, OriginalTimestamp } = request.input;

    const currentResult = await hasuraClient.query({
      query: GetRiskAssessmentResultConfigByIdDocument,
      variables: { Id },
    });

    const currentConfig =
      currentResult.data?.risk_assessment_result_config_by_pk;
    if (!currentConfig) {
      throw new NotFound('Risk assessment result configuration not found');
    }

    if (!currentConfig.IsLatest) {
      throw new BadRequest(
        'Only the latest version of risk assessment result configuration can be updated'
      );
    }

    if (
      new Date(currentConfig.ModifiedAtTimestamp).valueOf() !==
      new Date(OriginalTimestamp).valueOf()
    ) {
      throw new ModifiedSinceLastViewError();
    }

    validateChangesAgainstCurrent(currentConfig.Config, Config);

    const result = await hasuraClient.mutate({
      mutation: UpdateRiskAssessmentResultConfigDocument,
      variables: {
        Id,
        Config,
      },
    });

    const updated = result.data?.update_risk_assessment_result_config_by_pk;
    if (!updated) {
      throw new Error('Failed to update risk assessment result configuration');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: updated.Id,
        Version: updated.Version,
        IsLatest: updated.IsLatest,
      }),
    };
  }
);

/**
 * Validates that only cosmetic changes (titles, descriptions, names, colors) are made
 * between current and new configs. Structural changes (values, aggregation, matrix pairs)
 * are not allowed and should result in creating a new version instead.
 *
 * @throws BadRequest if non-cosmetic changes are detected
 */
const validateChangesAgainstCurrent = (
  currentConfig: RiskAssessmentResultConfig,
  newConfig: RiskAssessmentResultConfig
): void => {
  validateLikelihoodRatings(
    currentConfig.likelihood.ratings,
    newConfig.likelihood.ratings
  );
  validateImpactRatings(currentConfig.impact.ratings, newConfig.impact.ratings);
  validateImpactCategories(
    currentConfig.impact.categories,
    newConfig.impact.categories
  );
  validateImpactAggregationMethod(
    currentConfig.impact.aggregation,
    newConfig.impact.aggregation
  );
  validateMatrixEntries(currentConfig.matrix, newConfig.matrix);
};

const validateLikelihoodRatings = (
  currentRatings: RiskAssessmentResultConfig['likelihood']['ratings'],
  newRatings: RiskAssessmentResultConfig['likelihood']['ratings']
): void => {
  const currentValues = currentRatings.map((r) => r.value);
  const newValues = newRatings.map((r) => r.value);

  if (!sameValues(currentValues, newValues)) {
    throw new BadRequest(
      'Likelihood values cannot be changed. Create a new version instead.'
    );
  }
};

const validateImpactRatings = (
  currentRatings: RiskAssessmentResultConfig['impact']['ratings'],
  newRatings: RiskAssessmentResultConfig['impact']['ratings']
): void => {
  const currentValues = currentRatings.map((r) => r.value);
  const newValues = newRatings.map((r) => r.value);

  if (!sameValues(currentValues, newValues)) {
    throw new BadRequest(
      'Impact values cannot be changed. Create a new version instead.'
    );
  }
};

const validateImpactCategories = (
  currentCategories: RiskAssessmentResultConfig['impact']['categories'],
  newCategories: RiskAssessmentResultConfig['impact']['categories']
): void => {
  if (currentCategories.length !== newCategories.length) {
    throw new BadRequest(
      'Impact categories cannot be added or removed. Create a new version instead.'
    );
  }
};

const validateImpactAggregationMethod = (
  currentAggregation: RiskAssessmentResultConfig['impact']['aggregation'],
  newAggregation: RiskAssessmentResultConfig['impact']['aggregation']
): void => {
  if (currentAggregation !== newAggregation) {
    throw new BadRequest(
      'Impact aggregation method cannot be changed. Create a new version instead.'
    );
  }
};

const validateMatrixEntries = (
  currentMatrix: RiskAssessmentResultConfig['matrix'],
  newMatrix: RiskAssessmentResultConfig['matrix']
): void => {
  const currentCellMap = buildCellValueMap(currentMatrix);
  const newCellMap = buildCellValueMap(newMatrix);

  const currentKeys = new Set(currentCellMap.keys());
  const newKeys = new Set(newCellMap.keys());

  if (currentKeys.size !== newKeys.size) {
    throw new BadRequest(
      'Matrix cells cannot be added or removed. Create a new version instead.'
    );
  }

  for (const key of currentKeys) {
    if (!newKeys.has(key)) {
      throw new BadRequest(
        'Matrix cells cannot be added or removed. Create a new version instead.'
      );
    }

    if (currentCellMap.get(key) !== newCellMap.get(key)) {
      throw new BadRequest(
        'Matrix cell values cannot be changed. Create a new version instead.'
      );
    }
  }
};

/** Builds a map from "likelihood-impact" pair key to the entry's value */
const buildCellValueMap = (
  matrix: RiskAssessmentResultConfig['matrix']
): Map<string, number> => {
  const map = new Map<string, number>();
  for (const entry of matrix) {
    map.set(`${entry.likelihood}-${entry.impact}`, entry.value);
  }

  return map;
};

/** Checks if two number arrays contain the same values */
const sameValues = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v) => b.includes(v));
