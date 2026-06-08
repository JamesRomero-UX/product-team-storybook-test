import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIssueListQueryConfig } from '@risksmart-app/drizzle/src/queries/issue.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';
import type { GetIssueByIdResponseRow } from '../../issue.types';

export type IssueListResponseRow = InferQueryModel<
  'issue',
  typeof getIssueListQueryConfig
>;

export interface IssueByIdResponse {
  issue: GetIssueByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
