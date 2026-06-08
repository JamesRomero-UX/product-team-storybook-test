import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildOrganisation = (
  orgkey: string,
  overrides?: Partial<InferInsertModel<'organisation'>>
): InferInsertModel<'organisation'> => ({
  OrgKey: orgkey,
  Name: 'Trpc api test organisation',
  AuthTenant: 'Test',
  CreatedAtTimestamp: new Date().toISOString(),
  ScimEnabled: false,
  ...overrides,
});
