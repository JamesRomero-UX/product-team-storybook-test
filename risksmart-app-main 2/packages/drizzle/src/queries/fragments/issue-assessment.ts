import type { QueryConfig } from '../../db';

export const issueAssessment = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'issue_assessment'>;
