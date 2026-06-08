import type { QueryConfig } from '../db';
import { issueAssessment } from './fragments/index';
import { department } from './utils';

export const getIssueAssessmentQueryConfig = {
  ...issueAssessment,
  with: {
    policyOwner: {
      columns: {
        FriendlyName: true,
      },
    },
    certifiedIndividual: {
      columns: {
        FriendlyName: true,
      },
    },
    departments: {
      ...department,
    },
  },
} as const satisfies QueryConfig<'issue_assessment'>;
