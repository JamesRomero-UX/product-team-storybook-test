import type { GetAssessmentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export type AssessmentTypeEnum =
  | 'compliance_monitoring_assessment'
  | 'internal_audit_report'
  | 'rating';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type AssessmentFields = CollectionData<
  GetAssessmentsQuery['assessment'][number]
>;

export type AssessmentRegisterFields = AssessmentFields & {
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
