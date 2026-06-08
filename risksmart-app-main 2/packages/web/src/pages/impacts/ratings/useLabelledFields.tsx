import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';

import { getFriendlyId } from '@/utils/friendlyId';

import {
  getImpactPerformanceRating,
  getImpactPerformanceScore,
} from './performanceCalculation';
import { ImpactRatingStatus } from './ratingStatus';
import type {
  ImpactAppetites,
  ImpactRating,
  ImpactRatingTableFields,
} from './types';

export const useLabelledFields = (
  records: ImpactRating[] | undefined,
  impactAppetites?: ImpactAppetites
) => {
  const { getLabel: getLikelihoodLabel } = useRating('likelihood');

  return useMemo<ImpactRatingTableFields[] | undefined>(() => {
    const latestLookup: { [impactIdRatedItemId: string]: boolean } = {};
    // sort by test date so we can easily calculate if item is active
    const sortedRatings = [...(records ?? [])].sort(
      (a, b) => new Date(b.TestDate).getTime() - new Date(a.TestDate).getTime()
    );

    return sortedRatings?.map((d) => {
      const isArchived = !!latestLookup[d.ImpactId + '-' + d.RatedItemId];
      if (!isArchived) {
        latestLookup[d.ImpactId + '-' + d.RatedItemId] = true;
      }

      const impactAppetite = impactAppetites?.find(
        (ia) => ia.Id === d.ImpactId
      );
      const impactAppetiteForRatedItem = impactAppetite?.appetites.find((a) =>
        a?.parents.find((p) => p.risk?.Id === d.RatedItemId)
      );

      return {
        ...d,
        SequentialIdLabel: getFriendlyId(
          Parent_Type_Enum.ImpactRating,
          d.SequentialId
        ),
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        CompletedByUserName: d.completedBy?.FriendlyName || '-',
        Name: d.impact.Name ?? '-',
        // TODO: will need to add support for other types in future
        RatedItem: d.ratedItem.risk?.Title ?? '',
        PerformanceScore: _.isNil(impactAppetiteForRatedItem?.ImpactAppetite)
          ? null
          : getImpactPerformanceScore(
              d.Rating,
              impactAppetiteForRatedItem.ImpactAppetite
            ),
        Performance: getImpactPerformanceRating(
          d,
          impactAppetiteForRatedItem?.ImpactAppetite
        ),
        RatingScore: d.Rating,
        Status: isArchived
          ? ImpactRatingStatus.Archived
          : ImpactRatingStatus.Active,
        LikelihoodLabel: getLikelihoodLabel(d.Likelihood),
      };
    });
  }, [records, impactAppetites, getLikelihoodLabel]);
};
