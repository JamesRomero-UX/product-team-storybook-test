import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';

import { getFriendlyId } from '@/utils/friendlyId';

import { getImpactPerformanceScore } from './ratings/performanceCalculation';
import type { Impact, ImpactTableFields } from './types';

export const useLabelledFields = (records: Impact[] | undefined) => {
  return useMemo<ImpactTableFields[] | undefined>(() => {
    return records?.map((d) => {
      return {
        ...d,
        SequentialIdLabel: getFriendlyId(
          Parent_Type_Enum.Impact,
          d.SequentialId
        ),
        allOwners: getAllOwnersCellValue(d),
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        RatedItems: d.ratings
          .map((r) => r.ratedItem.risk?.Title)
          .filter((title) => title)
          .join(', '),
        PerformanceScore: d.ratings.reduce((previous, rating) => {
          const appetiteForRating = d.appetites.find((a) =>
            a?.parents.find((p) => p?.risk?.Id === rating.RatedItemId)
          );
          if (_.isNil(appetiteForRating?.ImpactAppetite)) {
            return previous;
          }

          return (
            previous +
            (getImpactPerformanceScore(
              rating.Rating,
              appetiteForRating.ImpactAppetite
            ) ?? 0)
          );
        }, 0),
      };
    });
  }, [records]);
};
