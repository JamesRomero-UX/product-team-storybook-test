import type {
  DepartmentPartsFragment,
  GetCausesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type CauseFlatField = CollectionData<GetCausesQuery['cause'][number]>;

export type CauseRegisterFields = CauseFlatField & {
  ModifiedByUserName: string;
  CreatedByUserName: string;
  IssueTitle: string;
  IssueSequentialId: null | number;
  IssueStatus: null | string;
  IssueStatusLabelled: string;
  IssueRaisedDate: null | string;
  IssueTypeLabelled: string;
  ParentTypeLabelled: string;
  IssueType?: null | string;
  IssueClosedDate: null | string;
  IssueSeverity: null | number;
  IssueSeverityLabelled: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  SignificanceLabelled: string;
  AssessmentDepartments?: DepartmentPartsFragment[] | null;
};
