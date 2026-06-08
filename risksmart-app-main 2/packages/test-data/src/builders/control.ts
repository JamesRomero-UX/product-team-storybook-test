import { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildControl = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'control'>>
): Omit<InferInsertModel<'control'>, 'SequentialId'> => ({
  Title: 'Test Control',
  Description: 'Test control description',
  Type: ControlType.Preventive,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  CustomAttributeData: {},
  ...overrides,
});
