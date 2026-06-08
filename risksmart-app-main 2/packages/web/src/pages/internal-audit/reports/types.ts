import type { GetInternalAuditReportsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type InternalAuditReportFields = CollectionData<
  GetInternalAuditReportsQuery['internal_audit_report'][number]
>;

export type InternalAuditReportRegisterFields = InternalAuditReportFields & {
  SequentialIdLabel: null | string;
  Title: string;
  ModifiedBy: string;
  CreatedBy: string;
  Status: string;
  StatusLabelled: string;
  Outcome?: null | number;
  OutcomeLabelled: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  AssessedItems: null | string;
};
