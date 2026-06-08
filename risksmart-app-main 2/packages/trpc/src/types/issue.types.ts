import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getIssueByIdQueryConfig,
  getIssueByInternalAuditReportIdQueryConfig,
  getIssueOwnersAndTagsQueryConfig,
  getIssuesByParentIdQueryConfig,
  getIssuesRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue.query';

import type { IssueAssessmentResponseRow } from './issue-assessment.types';
import type { IssueAssessmentParentResponseRow } from './issue-parent.types';

export type IssueRegisterResponseRow = InferQueryModel<
  'issue',
  typeof getIssuesRegisterQueryConfig
>;

export type GetIssueByIdResponseRow = InferQueryModel<
  'issue',
  typeof getIssueByIdQueryConfig
>;

export type GetIssuesByParentIdResponseRow = InferQueryModel<
  'issue',
  typeof getIssuesByParentIdQueryConfig
>;

export type GetIssuesByInternalAuditReportIdResponseRow = InferQueryModel<
  'issue',
  typeof getIssueByInternalAuditReportIdQueryConfig
>;

export type GetIssuesByInternalAuditReportIdResponse =
  GetIssuesByInternalAuditReportIdResponseRow & {
    actions_aggregate: { aggregate: { count: number } };
  };
export type GetIssueOwnersAndTagsResponseRow = InferQueryModel<
  'issue',
  typeof getIssueOwnersAndTagsQueryConfig
>;

export interface GetIssueAssessmentByParentIdResponse {
  issue_assessment: IssueAssessmentResponseRow[];
  issue: GetIssueOwnersAndTagsResponseRow[];
  issue_parent: IssueAssessmentParentResponseRow[];
}

export interface CreateIssueResponse {
  Id: string;
  SequentialId: number | null;
}

export interface UpdateIssueResponse {
  Id: string;
}
