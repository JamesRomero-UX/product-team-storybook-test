import { ApprovalInFlightEditRule } from '@risksmart-app/domain/src/types/consts/approval-in-flight-edit-rule';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildApproval = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'approval'>>;
}): InferInsertModel<'approval'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  Workflow: 'risk',
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
  InFlightEditRule: ApprovalInFlightEditRule.Approvers,
  ParentId: null,
  ...overrides,
});
