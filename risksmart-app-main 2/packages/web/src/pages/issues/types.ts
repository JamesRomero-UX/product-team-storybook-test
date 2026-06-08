import type {
  DepartmentPartsFragment,
  GetIssuesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';
import type { LinkItem } from '@/utils/table/hooks/useLinkArrayField';

export type IssueFlatField = CollectionData<GetIssuesQuery['issue'][number]>;

export type IssueRegisterFields = IssueFlatField & {
  IssueTypeLabelled: string;
  SeverityLabelled: string;
  StatusLabelled: string;
  Severity?: null | number;
  OpenActions?: null | number;
  Status?: null | string;
  TargetCloseDate?: null | string;
  IssueType?: null | string;
  ActualCloseDate?: null | string;
  CertifiedIndividual?: null | string;
  IssueCausedBySystemIssue?: boolean | null;
  IssueCausedByThirdParty?: boolean | null;
  PolicyBreach?: boolean | null;
  PolicyOwner?: null | string;
  PolicyOwnerCommentary?: null | string;
  Rationale?: null | string;
  Reportable?: boolean | null;
  SystemResponsible?: null | string;
  ThirdPartyResponsible?: null | string;
  ModifiedByUserName?: null | string;
  CreatedByUserName?: null | string;
  AssessmentCreatedBy?: null | string;
  AssessmentModifiedBy?: null | string;
  PoliciesBreached?: null | string;
  RegulatoryBreach?: boolean | null;
  RegulationsBreached?: null | string;
  ParentTitle?: LinkItem[];
  ParentId?: null | string;
  SequentialIdLabel?: null | string;
  AssessmentDepartments?: DepartmentPartsFragment[] | null;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  Cost: number;
  Hours: number;
  CustomersImpacted: number;
  TimeToResolve: null | number;
  TimeToReport: number;
  TimeToIdentify: number;
  TimeSinceCreated: number;
  InternalOrExternalIssue: string | null;
};
