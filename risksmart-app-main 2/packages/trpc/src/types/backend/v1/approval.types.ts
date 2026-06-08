import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getApprovalByIdConfig,
  getApprovalListQueryConfig,
} from '@risksmart-app/drizzle/src/queries/approval.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ApprovalListResponseRow = InferQueryModel<
  'approval',
  typeof getApprovalListQueryConfig
>;

export type ApprovalByIdResponseRow = InferQueryModel<
  'approval',
  typeof getApprovalByIdConfig
>;

export interface ApprovalByIdResponse {
  approval: ApprovalByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
