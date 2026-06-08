import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildObligationChange = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'obligation_change'>>;
}): Omit<InferInsertModel<'obligation_change'>, 'SequentialId'> => ({
  Id: randomUUID(),
  ExternalId: `ext-${randomUUID()}`,
  DescriptionBefore: 'Test obligation change description before',
  DescriptionAfter: 'Test obligation change description after',
  EffectiveDate: '2024-06-01T00:00:00Z',
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
