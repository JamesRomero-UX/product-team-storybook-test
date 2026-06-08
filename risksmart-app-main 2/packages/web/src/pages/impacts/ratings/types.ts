import type {
  GetAppetitesGroupedByImpactQuery,
  GetImpactRatingsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

import type { ImpactRatingStatus } from './ratingStatus';

export type ImpactRating = CollectionData<
  GetImpactRatingsQuery['impact_rating'][number]
>;

export type ImpactAppetites = CollectionData<
  GetAppetitesGroupedByImpactQuery['impact']
>;

export type ImpactRatingTableFields = ImpactRating & {
  Name: null | string;
  SequentialIdLabel: null | string;
  CreatedByUserName: null | string;
  RatedItem: null | string;
  Performance: null | string;
  CompletedByUserName: null | string;
  RatingScore: number;
  Status: ImpactRatingStatus;
  PerformanceScore: null | number;
  LikelihoodLabel: null | string;
};
