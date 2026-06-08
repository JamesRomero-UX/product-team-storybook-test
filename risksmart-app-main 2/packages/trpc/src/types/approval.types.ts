import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getGlobalApprovalsQueryConfig } from '@risksmart-app/drizzle/src/queries/approval.query';

export type ApprovalResponseRow = InferQueryModel<
  'approval',
  typeof getGlobalApprovalsQueryConfig
>;

export interface ApprovalResponse {
  approval: ApprovalResponseRow[];
}
