import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildOrganisationModule = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'organisation_module'>>;
}): InferInsertModel<'organisation_module'> => ({
  OrgKey: orgKey,
  ModuleSettings: { modules: [] },
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
