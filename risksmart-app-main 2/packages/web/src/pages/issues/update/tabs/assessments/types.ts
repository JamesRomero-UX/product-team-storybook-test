import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { IssueAssessmentFields } from '../../forms/issue-assessment-form/issueAssessmentSchema';

export type IssueAssessmentRequestedChanges = IssueAssessmentFields & {
  parents: {
    IssueId: string;
    ParentId: string;
    ParentType: Parent_Type_Enum;
  }[];
  CertifiedIndividual?: string;
  PolicyOwner?: string;
};
