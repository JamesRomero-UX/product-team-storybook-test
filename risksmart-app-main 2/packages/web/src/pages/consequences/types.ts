import type {
  DepartmentPartsFragment,
  GetConsequencesQuery,
  TagPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ConsequenceFlatField = CollectionData<
  GetConsequencesQuery['consequence'][number]
>;

export type ConsequenceRegisterFields = ConsequenceFlatField & {
  ModifiedByUserName: string;
  CreatedByUserName: string;
  CriticalityLabelled: string;
  CostTypeLabelled: string;
  TypeLabelled: string;
  IssueSequentialId: null | number;
  IssueTitle: string;
  IssueStatus: null | string;
  IssueStatusLabelled: string;
  IssueType?: null | string;
  IssueTypeLabelled: string;
  ParentTypeLabelled: string;
  IssueRaisedDate: null | string;
  IssueClosedDate: null | string;
  IssueSeverity: null | number;
  IssueSeverityLabelled: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  CostFinancial: null | number;
  CostNumber: null | number;
  CostHours: null | number;
  departments: DepartmentPartsFragment[];
  tags: TagPartsFragment[];
  AssessmentDepartments?: DepartmentPartsFragment[] | null;
};
