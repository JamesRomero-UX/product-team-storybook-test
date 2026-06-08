import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildBusinessArea = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'business_area'>>
): Omit<InferInsertModel<'business_area'>, 'SequentialId'> => ({
  Id: randomUUID(),
  Title: 'Test Business Area',
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ...overrides,
});
