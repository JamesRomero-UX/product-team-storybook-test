import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type {
  GetAppetitesGroupedByImpactQuery,
  GetImpactRatingsByImpactIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  getImpactPerformanceRating,
  getImpactPerformanceScore,
} from 'src/pages/impacts/ratings/performanceCalculation';
import { ImpactRatingStatus } from 'src/pages/impacts/ratings/ratingStatus';

import useEntityInfo from '@/hooks/getEntityInfo';

import type { ImpactRatingTableFields } from './types';

export const useLabelledFields = (
  data: GetImpactRatingsByImpactIdQuery['impact_rating'] | undefined,
  impactAppetites: GetAppetitesGroupedByImpactQuery['impact'] | undefined
) => {
  const { getLabel: getLikelihoodLabel } = useRating('likelihood');
  const getEntityInfo = useEntityInfo();

  return useMemo<ImpactRatingTableFields[]>(() => {
    const latestLookup: { [id: string]: boolean } = {};

    // sort by test date so we can easily calculate if item is active
    const sortedRatings = [...(data ?? [])].sort(
      (a, b) => new Date(b.TestDate).getTime() - new Date(a.TestDate).getTime()
    );

    return (
      sortedRatings?.map((ir) => {
        const isArchived = !!latestLookup[ir.RatedItemId];
        if (!isArchived) {
          latestLookup[ir.RatedItemId] = true;
        }

        const impactAppetite = impactAppetites?.find(
          (ia) => ia.Id === ir.ImpactId
        );
        const impactAppetiteForRatedItem = impactAppetite?.appetites.find((a) =>
          a?.parents.find((p) => p.risk?.Id === ir.RatedItemId)
        );

        return {
          ...ir,
          LikelihoodLabel: getLikelihoodLabel(ir.Likelihood),
          Performance: getImpactPerformanceRating(
            ir,
            impactAppetiteForRatedItem?.ImpactAppetite
          ),
          PerformanceScore: _.isNil(impactAppetiteForRatedItem?.ImpactAppetite)
            ? null
            : getImpactPerformanceScore(
                ir.Rating,
                impactAppetiteForRatedItem?.ImpactAppetite
              ),
          Type: getEntityInfo(ir.ratedItem.ObjectType).singular,
          Status: isArchived
            ? ImpactRatingStatus.Archived
            : ImpactRatingStatus.Active,
        };
      }) || []
    );
  }, [data, impactAppetites, getLikelihoodLabel, getEntityInfo]);
};
