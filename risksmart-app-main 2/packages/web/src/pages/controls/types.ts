import type { GetControlsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';
import type { LinkItem } from '@/utils/table/hooks/useLinkArrayField';
import type { TrendIndicator } from '@/utils/trendCalculation';

export type ControlFlatFields = CollectionData<
  GetControlsQuery['control'][number]
>;

export type ControlTableFields = Omit<
  ControlFlatFields,
  'ParentTitle' | 'TestFrequency'
> & {
  DesignEffectiveness: null | number;
  DesignEffectivenessLabelled: string;
  PerformanceEffectiveness: null | number;
  PerformanceEffectivenessLabelled: string;
  OverallEffectivenessLabelled: string;
  OverallEffectiveness: null | number;
  OverallEffectivenessHistory: {
    rating: number;
    id: string;
    testDate: string;
  }[];
  OverallEffectivenessTrend: TrendIndicator | null;
  OverallEffectivenessTrendLabelled: string;
  OpenIssues: null | number;
  IssueCount: null | number;
  OpenActions: null | number;
  CreatedByUserName: null | string;
  TestFrequency: null | string;
  ControlTypeLabelled: string;
  SequentialIdLabel: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  NextTestDate: null | string;
  NextTestOverdueDate: null | string;
  LatestRatingDate: null | string;
  ControlGroups: LabelledIdArray;
  LinkedIndicatorCount: number;
  ParentTitle: LinkItem[];
  TestScheduleStatus: null | string;
  TestScheduleStatusLabelled: null | string;
};
