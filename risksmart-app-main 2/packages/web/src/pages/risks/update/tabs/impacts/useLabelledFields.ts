import type {
  GetActiveAppetitesByParentIdQuery,
  GetImpactRatingsByRatedItemIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Appetite_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  getImpactPerformanceRating,
  getImpactPerformanceScore,
  getLikelihoodPerformanceRating,
  getLikelihoodPerformanceScore,
  getPerformanceRating,
} from 'src/pages/impacts/ratings/performanceCalculation';
import { ImpactRatingStatus } from 'src/pages/impacts/ratings/ratingStatus';

import type { ImpactRatingTableFields } from './types';

export const useLabelledFields = (
  data: GetImpactRatingsByRatedItemIdQuery | undefined,
  appetiteData:
    | GetActiveAppetitesByParentIdQuery['appetite_parent'][number]['appetite'][]
    | undefined
) => {
  return useMemo<ImpactRatingTableFields[]>(() => {
    const impactAppetites = appetiteData?.filter(
      (a) => a?.AppetiteType === Appetite_Type_Enum.Impact
    );
    const likelihoodAppetites = appetiteData?.filter(
      (a) => a?.AppetiteType === Appetite_Type_Enum.Likelihood
    );
    const latestLookup: { [id: string]: boolean } = {};

    return (data?.impact_rating || []).map((d) => {
      const isArchived = latestLookup[d.ImpactId];
      if (!isArchived) {
        latestLookup[d.ImpactId] = true;
      }
      const impactAppetite = impactAppetites?.find(
        (a) => a?.impact?.Id === d.ImpactId
      );
      const likelihoodAppetite = likelihoodAppetites?.[0];
      const performanceScore = getImpactPerformanceScore(
        d.Rating,
        impactAppetite?.ImpactAppetite
      );
      const performanceRatingValue = getPerformanceRating(performanceScore);

      return {
        ...d,
        Performance: getImpactPerformanceRating(
          d,
          impactAppetite?.ImpactAppetite
        ),
        LikelihoodPerformance: getLikelihoodPerformanceRating(
          d,
          likelihoodAppetite?.LikelihoodAppetite
        ),
        LikelihoodPerformanceScore: getLikelihoodPerformanceScore(
          d,
          likelihoodAppetite?.LikelihoodAppetite
        ),
        PerformanceScore: performanceScore,
        PerformanceRatingValue: performanceRatingValue,
        Rationale: d.impact.Rationale || null,
        CompletedByUserName: d.completedBy?.FriendlyName || null,
        Name: d.impact.Name,
        Status: isArchived
          ? ImpactRatingStatus.Archived
          : ImpactRatingStatus.Active,
      };
    });
  }, [appetiteData, data?.impact_rating]);
};
