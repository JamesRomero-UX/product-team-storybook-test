import type { GetImpactRatingsWithAppetitesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';

import { ImpactRatingStatus } from '../../../../impacts/ratings/ratingStatus';
import type { ImpactRatingTableFields } from '../../../../impacts/ratings/types';
import type { RiskRegisterFields } from '../../../../risks/types';

export const useCalculatePlacematRatings = (
  risks: readonly RiskRegisterFields[],
  impactRatings: readonly ImpactRatingTableFields[],
  data: GetImpactRatingsWithAppetitesQuery | undefined
) => {
  const getLikelihoodAppetite = useCallback(
    (riskId: string) => {
      if (!data) {
        return null;
      }
      const ratings = data.impact_rating.filter(
        (ir) => ir.RatedItemId === riskId
      );

      return ratings[0]?.ratedItem.risk?.likelihoodAppetite[0]?.appetite;
    },
    [data]
  );

  const getImpactAppetite = useCallback(
    (riskId: string, impactId: string) => {
      if (!data) {
        return null;
      }
      const ratings = data.impact_rating.filter(
        (ir) => ir.RatedItemId === riskId
      );

      return ratings[0]?.ratedItem.risk?.impactAppetites.find(
        (ia) => ia.appetite?.ImpactId === impactId
      )?.appetite;
    },
    [data]
  );

  return useMemo(() => {
    if (!impactRatings) {
      return {};
    }
    const riskIds = risks.map((risk) => risk.Id) ?? [];

    const ratings = impactRatings.filter(
      (rating) =>
        riskIds.includes(rating.RatedItemId) &&
        rating.Status === ImpactRatingStatus.Active
    );

    return _.mapValues(_.groupBy(ratings, 'RatedItemId'), (ratings) => {
      const riskId = ratings[0].RatedItemId;
      const riskName = ratings[0].RatedItem;
      const likelihoodAppetite = getLikelihoodAppetite(riskId);
      const likelihoodRating = _.meanBy(ratings, (r) => r.Likelihood);

      return {
        riskName,
        likelihood:
          typeof likelihoodAppetite?.LikelihoodAppetite === 'number'
            ? likelihoodAppetite.LikelihoodAppetite - likelihoodRating
            : 0,
        ratings: ratings.reduce<Record<string, number>>((acc, rating) => {
          const appetite = getImpactAppetite(riskId, rating.ImpactId);

          acc[rating.ImpactId] =
            typeof appetite?.ImpactAppetite === 'number'
              ? appetite.ImpactAppetite - (rating.Rating ?? 0)
              : 0;

          return acc;
        }, {}),
      };
    });
  }, [impactRatings, risks, getImpactAppetite, getLikelihoodAppetite]);
};
