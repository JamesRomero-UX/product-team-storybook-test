import type {
  DepartmentPartsFragment,
  GetDocumentsQuery,
  TagPartsFragment,
  Version_Status_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { JSONObject } from '@/types/types';
import type { CollectionData } from '@/utils/collectionUtils';
import type { TrendIndicator } from '@/utils/trendCalculation';

import type { ReviewStatusValue } from './helpers';

export type DocumentFields = CollectionData<
  GetDocumentsQuery['document'][number]
>;

export type PolicyRegisterFields = Pick<DocumentFields, 'assessmentResults'> & {
  Id: string;
  Title: string;
  Parent: null | string;
  DocumentType: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  tags: TagPartsFragment[];
  departments: DepartmentPartsFragment[];
  CreatedByUserId: string;
  ModifiedByUserId: string;
  CreatedByUserName: null | string;
  ModifiedByUserName: null | string;
  CreatedAtTimestamp: string;
  ModifiedAtTimestamp: string;
  PerformanceResult: null | string;
  PerformanceResultValue: null | number;
  PerformanceTrend: TrendIndicator | null;
  PerformanceTrendLabelled: string;
  Status: null | string;
  StatusValue: null | Version_Status_Enum;
  VersionStatusSortKey: number;
  ReviewDate: null | string;
  NextReviewDate: null | string;
  ReviewStatus: string;
  ReviewStatusValue: ReviewStatusValue;
  ReviewStatusSortKey: number;
  CustomAttributeData: JSONObject | null;
  SequentialIdLabel: null | string;
  SequentialId: null | number | undefined;
  Download: boolean;
  NextTestDate: null | string;
  LatestRatingDate: null | string;
  TestFrequency: null | string;
  LastApprovedDate: null | string;
  LastPublishedDate: null | string;
};
