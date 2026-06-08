import type { GetInternalAuditsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type InternalAuditFields = CollectionData<
  GetInternalAuditsQuery['internal_audit_entity'][number]
>;

export type InternalAuditRegisterFields = InternalAuditFields & {
  SequentialIdLabel: null | string;
  Title: string;
  BusinessArea: string;
  ModifiedBy: string;
  CreatedBy: string;
  UserName: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  LatestReportDate: null | string;
  AuditRating: null | number | undefined;
  AuditRatingLabelled: string;
  OpenActionCount: number;
  OpenIssueCount: number;
  ReportStatus: string;
  ReportStatusLabelled: string;
};
