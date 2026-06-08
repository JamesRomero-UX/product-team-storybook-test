import { randomUUID } from 'crypto';

import type { AuthOrganisationInsertInput } from '../generated/graphql';

const defaultOrganisation: AuthOrganisationInsertInput = {
  Name: 'Org 1',
  AuthTenant: 'Tenant 1',
};

export const buildOrganisationInsert = (
  overrides: Partial<AuthOrganisationInsertInput> = {}
): AuthOrganisationInsertInput => {
  return {
    ...defaultOrganisation,
    OrgKey: randomUUID(),
    ...overrides,
  };
};
