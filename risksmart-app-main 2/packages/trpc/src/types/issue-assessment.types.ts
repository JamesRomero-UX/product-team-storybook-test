import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIssueAssessmentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-assessment.query';

export type IssueAssessmentResponseRow = InferQueryModel<
  'issue_assessment',
  typeof getIssueAssessmentQueryConfig
>;
