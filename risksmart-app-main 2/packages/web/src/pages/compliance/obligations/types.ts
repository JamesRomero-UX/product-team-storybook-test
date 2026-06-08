import type { GetObligationsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';
import type { TrendIndicator } from '@/utils/trendCalculation';

export type ObligationFields = CollectionData<
  GetObligationsQuery['obligation'][0]
>;

export type ObligationTableFields = Omit<
  ObligationFields,
  'CreatedBy' | 'ModifiedBy' | 'Owner' | 'TestFrequency'
> & {
  LatestAssessmentResultsLabelled: string;
  LatestAssessmentResult: number;
  LatestAssessmentStatus: string;
  LinkedControlCount: number;
  ParentTitle: null | string;
  TypeLabel: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  CreatedBy: null | string;
  ModifiedBy: null | string;
  SequentialIdLabel: null | string;
  NextTestDate: null | string;
  LatestRatingDate: null | string;
  TestFrequency: null | string;
  RatingTrend: null | TrendIndicator;
  RatingTrendLabelled: null | string;
};
