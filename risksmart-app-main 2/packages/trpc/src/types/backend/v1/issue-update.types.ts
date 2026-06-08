import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getIssueUpdateByIdQueryConfig,
  getIssueUpdatesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue-update.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type IssueUpdateListResponseRow = InferQueryModel<
  'issue_update',
  typeof getIssueUpdatesByParentIssueIdQueryConfig
>;

export type IssueUpdateByIdResponseRow = InferQueryModel<
  'issue_update',
  typeof getIssueUpdateByIdQueryConfig
>;

export interface IssueUpdateByIdResponse {
  update: IssueUpdateByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
