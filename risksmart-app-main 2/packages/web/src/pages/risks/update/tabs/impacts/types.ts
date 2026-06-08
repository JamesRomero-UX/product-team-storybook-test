import type { GetImpactRatingsByRatedItemIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ImpactPerformanceRating } from 'src/pages/impacts/ratings/performanceCalculation';
import type { ImpactRatingStatus } from 'src/pages/impacts/ratings/ratingStatus';

import type { CollectionData } from '@/utils/collectionUtils';

export type ImpactRatingTableFields = CollectionData<
  GetImpactRatingsByRatedItemIdQuery['impact_rating'][number] & {
    Performance: string;
    Rationale: null | string;
    CompletedByUserName: null | string;
    Name: null | string;
    Status: ImpactRatingStatus;
    PerformanceScore: null | number;
    LikelihoodPerformanceScore: null | number;
    LikelihoodPerformance: string;
    PerformanceRatingValue: ImpactPerformanceRating | null;
  }
>;
