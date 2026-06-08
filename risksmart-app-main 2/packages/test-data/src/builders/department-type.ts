import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildDepartmentType = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'department_type'>>
): InferInsertModel<'department_type'> => ({
  DepartmentTypeId: randomUUID(),
  Name: 'Test Department Type',
  Description: 'Test department type description',
  ModifiedByUser: userId,
  OrgKey: orgkey,
  CreatedByUser: userId,
  ...overrides,
});
