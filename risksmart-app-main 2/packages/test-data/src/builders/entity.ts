import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildEntity = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'entity'>>
): InferInsertModel<'entity'> => ({
  Id: randomUUID(),
  Name: 'Test Entity',
  Description: 'Test entity description',
  ParentId: null,
  OrgKey: orgkey,
  Weight: 1.0,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ...overrides,
});
