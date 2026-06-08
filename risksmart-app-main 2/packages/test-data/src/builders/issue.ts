import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildIssue = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'issue'>>
): InferInsertModel<'issue'> => ({
  Id: randomUUID(),
  Title: 'Test Issue',
  Details: 'Test issue details',
  ImpactsCustomer: false,
  IsExternalIssue: false,
  DateOccurred: '2024-01-15T10:00:00Z',
  DateIdentified: '2024-01-15T10:00:00Z',
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  OrgKey: orgkey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  CustomAttributeData: {},
  RaisedAtTimestamp: '2024-01-15T10:00:00Z',
  Type: ParentTypes.Issue,
  ...overrides,
});
