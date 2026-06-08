import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildObligationImpact = ({
  orgKey,
  userId,
  parentObligationId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentObligationId: string;
  overrides?: Partial<InferInsertModel<'obligation_impact'>>;
}): InferInsertModel<'obligation_impact'> => ({
  ParentObligationId: parentObligationId,
  Description: 'Test obligation impact description',
  ImpactRating: 3,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  CustomAttributeData: {},
  ...overrides,
});
