import type { GetImpactRatingsByImpactIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ImpactRatingStatus } from 'src/pages/impacts/ratings/ratingStatus';

type ImpactRating = GetImpactRatingsByImpactIdQuery['impact_rating'][number];

export type ImpactRatingTableFields = ImpactRating & {
  Performance: string;
  PerformanceScore: null | number;
  Type: string;
  Status: ImpactRatingStatus;
  LikelihoodLabel: string;
};
