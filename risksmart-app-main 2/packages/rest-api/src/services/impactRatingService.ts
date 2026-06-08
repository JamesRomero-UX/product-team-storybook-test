import type { ApolloClient } from '@apollo/client';
import type {
  GetImpactsWithLatestDatedRiskRatingQuery,
  GetImpactsWithLatestDatedRiskRatingQueryVariables,
} from 'generated/graphql';
import { GetImpactsWithLatestDatedRiskRatingDocument } from 'generated/graphql';

import { getLogger } from '../logger';
const logger = getLogger();

export const getImpactsWithLatestDatedRiskRating = async (
  hasuraClient: ApolloClient<unknown>,
  variables: GetImpactsWithLatestDatedRiskRatingQueryVariables
) => {
  logger.info('Get impacts with latest dated risk rating');
  const result = await hasuraClient.query({
    query: GetImpactsWithLatestDatedRiskRatingDocument,
    variables,
  });
  if (result.errors) {
    logger.error('Error getting impact ratings', { errors: result.errors });
    throw new Error('Error getting impact ratings');
  }

  return result.data.impact;
};
/**
 * From all impacts, gets the impact that was rated the longest time ago, and
 * gets it's test date.
 *
 * @param data Latest Impact rating for each impact
 */
export const getOldestActiveImpactTestDate = (
  impacts: GetImpactsWithLatestDatedRiskRatingQuery['impact']
) => {
  const orderedTestDates = impacts
    .flatMap((i) => i.ratings)
    .map((r) => r.TestDate)
    .sort();

  return orderedTestDates[0] ?? null;
};
