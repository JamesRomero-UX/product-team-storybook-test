import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIssueAssessmentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-assessment.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type IssueAssessmentListResponseRow = InferQueryModel<
  'issue_assessment',
  typeof getIssueAssessmentQueryConfig
>;

export interface IssueAssessmentResponse {
  issueAssessment: IssueAssessmentListResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
