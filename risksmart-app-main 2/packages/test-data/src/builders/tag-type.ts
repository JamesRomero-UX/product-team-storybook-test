import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildTagType = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'tag_type'>>
): InferInsertModel<'tag_type'> => ({
  TagTypeId: randomUUID(),
  Name: 'Test Tag Type',
  Description: 'Test tag type description',
  ModifiedByUser: userId,
  OrgKey: orgkey,
  CreatedByUser: userId,
  ...overrides,
});
