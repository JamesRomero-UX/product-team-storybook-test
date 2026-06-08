import type { GetIndicatorsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type IndicatorFlatFields = CollectionData<
  GetIndicatorsQuery['indicator'][0]
>;
export enum ConformanceIndicatorRating {
  NotSet = 0,
  Outside = 1,
  OutsideAppetite = 3,
  Within = 2,
}

export enum ConformanceTrend {
  Deteriorating = 'deteriorating',
  Improving = 'improving',
  Stable = 'stable',
}

export type TestScheduleStatus = '-' | 'due' | 'overdue';
export type TestScheduleStatusLabelled = string;

export type IndicatorTableFields = IndicatorFlatFields & {
  CreatedByUserName: string | undefined;
  ModifiedByUserName: string | undefined;
  Conformance: ConformanceIndicatorRating;
  ConformanceLabelled: number | string | undefined;
  ConformanceTrend: string | undefined;
  ConformanceTrendValue: ConformanceTrend | null;
  LatestResultLabelled: string | undefined;
  PreviousResultLabelled: string | undefined;
  LatestResultDateLabelled: string | undefined;
  TestFrequencyLabelled: string | undefined;
  ParentTitle: string | undefined;
  ParentType: string | undefined;
  SequentialIdLabel: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  NextTestOverdueDate: string | undefined;
  NextTestDate: string | undefined;
  TestScheduleStatus: TestScheduleStatus;
  TestScheduleStatusLabelled: TestScheduleStatusLabelled;
};
