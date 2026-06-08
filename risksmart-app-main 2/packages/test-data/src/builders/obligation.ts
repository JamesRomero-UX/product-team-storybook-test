import { ObligationType } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildObligation = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'obligation'>>;
}): InferInsertModel<'obligation'> => ({
  Title: 'Test obligation title',
  Description: 'Test obligation description',
  Adherence: 'full',
  Type: ObligationType.Standard,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  CustomAttributeData: {},
  ...overrides,
});
