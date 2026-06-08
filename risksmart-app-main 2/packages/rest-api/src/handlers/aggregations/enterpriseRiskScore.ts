import i18n from '@risksmart-app/i18n/src/i18n';
import { getRatingByRange } from '@risksmart-app/i18n/src/ratings';
import type { EnterpriseRiskScoreInsertInput } from 'generated/graphql';
import {
  GetAllRiskScoresForEnterpriseRiskDocument,
  InsertEnterpriseRiskScoresDocument,
} from 'generated/graphql';
import type { KeyPrefix } from 'i18next';
import _ from 'lodash';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { initI18n } from 'src/i18n';
import { getLogger } from 'src/logger';
import { SYSTEM_USER } from 'src/repositories/types';

import type { RatingCategory } from './types';

const logger = getLogger();

// Typed helper to avoid expensive type assertions
const getRatingCategories = (key: KeyPrefix<'ratings'>): RatingCategory[] => {
  /* @ts-ignore  TS2589: Type instantiation is excessively deep and possibly infinite. */
  return i18n.t(key, {
    ns: 'ratings',
    returnObjects: true,
  }) as RatingCategory[];
};

const getMedianIndices = (length: number) => {
  return length % 2 === 0
    ? [length / 2 - 1, length / 2]
    : [Math.floor(length / 2)];
};

// Calculate weighted average using entity weights
const calculateWeightedAverage = <T>(
  items: T[],
  scoreKey: keyof T,
  weightGetter: (item: T) => number | null | undefined
): number | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  items.forEach((item) => {
    const score = item[scoreKey];
    const weight = weightGetter(item) ?? 1.0;

    if (typeof score === 'number' && weight > 0) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : undefined;
};

export const recalculate = async (orgKey: string, tenant: string) => {
  logger.appendKeys({
    orgKey,
    tenant,
  });

  const hasuraClient = getHasuraBackendClient(
    tenant,
    orgKey,
    SYSTEM_USER,
    'RiskManager'
  );

  const adminClient = getHasuraAdminClient(tenant);

  await initI18n(orgKey, adminClient);

  logger.info('Recalculating enterprise risk scores');

  const { data: riskScores } = await adminClient.query({
    query: GetAllRiskScoresForEnterpriseRiskDocument,
    variables: {
      OrgKey: orgKey,
    },
  });

  const riskScoresGroupedByEnterpriseRisk = _.groupBy(
    riskScores.risk_score,
    'risk.enterpriseRiskInstance.EnterpriseRiskId'
  );

  const enterpriseRiskScores: EnterpriseRiskScoreInsertInput[] = [];

  const inherentRatingCategories = getRatingCategories('risk_uncontrolled');
  const residualRatingCategories = getRatingCategories('risk_controlled');

  Object.getOwnPropertyNames(riskScoresGroupedByEnterpriseRisk).forEach(
    (enterpriseRiskId) => {
      // Get the indices for the median items.
      // For scores with an odd length, get the middle item, for even lengths, get the two middle items.
      const medianIndices = getMedianIndices(
        riskScoresGroupedByEnterpriseRisk[enterpriseRiskId]?.length ?? 0
      );

      const sortedByInherentScores = _.sortBy(
        riskScoresGroupedByEnterpriseRisk[enterpriseRiskId],
        'InherentScore'
      );

      const sortedByResidualScores = _.sortBy(
        riskScoresGroupedByEnterpriseRisk[enterpriseRiskId],
        'ResidualScore'
      );

      const scores = {
        InherentScoreMean: calculateWeightedAverage(
          riskScoresGroupedByEnterpriseRisk[enterpriseRiskId] ?? [],
          'InherentScore',
          (item) => item.risk?.enterpriseRiskInstance?.entity?.Weight
        ),
        ResidualScoreMean: calculateWeightedAverage(
          riskScoresGroupedByEnterpriseRisk[enterpriseRiskId] ?? [],
          'ResidualScore',
          (item) => item.risk?.enterpriseRiskInstance?.entity?.Weight
        ),
        InherentScoreMedian: medianIndices.map(
          (idx) => sortedByInherentScores[idx]?.InherentScore
        ),
        ResidualScoreMedian: medianIndices.map(
          (idx) => sortedByResidualScores[idx]?.ResidualScore
        ),
        InherentScoreWorstCase: _.maxBy(
          riskScoresGroupedByEnterpriseRisk[enterpriseRiskId],
          'InherentScore'
        )?.InherentScore,
        ResidualScoreWorstCase: _.maxBy(
          riskScoresGroupedByEnterpriseRisk[enterpriseRiskId],
          'ResidualScore'
        )?.ResidualScore,
      };

      const ratings = {
        InherentRatingMean: getRatingByRange(
          inherentRatingCategories,
          scores.InherentScoreMean ?? null
        )?.value,
        ResidualRatingMean: getRatingByRange(
          residualRatingCategories,
          scores.ResidualScoreMean ?? null
        )?.value,
        InherentRatingMedian: scores.InherentScoreMedian.map(
          (s) => getRatingByRange(inherentRatingCategories, s ?? null)?.value
        ),
        ResidualRatingMedian: scores.ResidualScoreMedian.map(
          (s) => getRatingByRange(residualRatingCategories, s ?? null)?.value
        ),
        InherentRatingWorstCase: getRatingByRange(
          inherentRatingCategories,
          scores.InherentScoreWorstCase ?? null
        )?.value,
        ResidualRatingWorstCase: getRatingByRange(
          residualRatingCategories,
          scores.ResidualScoreWorstCase ?? null
        )?.value,
      };

      enterpriseRiskScores.push({
        EnterpriseRiskId: enterpriseRiskId,
        ...scores,
        ...ratings,
      } as EnterpriseRiskScoreInsertInput);
    }
  );

  await hasuraClient.mutate({
    mutation: InsertEnterpriseRiskScoresDocument,
    variables: {
      objects: enterpriseRiskScores,
    },
  });
};
