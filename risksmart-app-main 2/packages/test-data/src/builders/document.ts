import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildDocument = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'document'>>
): InferInsertModel<'document'> => ({
  Id: randomUUID(),
  Title: 'Test Document',
  DocumentType: 'Policy',
  Purpose: 'Test document purpose',
  OrgKey: orgkey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  CustomAttributeData: {},
  ...overrides,
});
