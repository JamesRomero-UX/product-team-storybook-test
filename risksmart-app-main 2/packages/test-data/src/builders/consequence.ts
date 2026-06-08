import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildConsequence = ({
  orgKey,
  userId,
  parentIssueId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentIssueId: string;
  overrides?: Partial<InferInsertModel<'consequence'>>;
}): InferInsertModel<'consequence'> => ({
  Id: randomUUID(),
  Title: 'Test Consequence',
  Description: 'Test consequence description',
  Criticality: null,
  CostType: CostType.Financial,
  CostValue: 100,
  ParentIssueId: parentIssueId,
  Type: null,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: undefined,
  Meta: null,
  CustomAttributeData: null,
  ...overrides,
});
