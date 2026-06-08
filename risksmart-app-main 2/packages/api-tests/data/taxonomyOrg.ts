import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { TaxonomyOrgInsertInput } from '../generated/graphql';

const defaultTaxonomyOrg: TaxonomyOrgInsertInput = {
  ModifiedAtTimestamp: undefined,
  CreatedAtTimestamp: undefined,
  Locale: 'en',
  OrgName: 'Org1',
};

export const buildTaxonomyOrg = (
  overrides: Partial<TaxonomyOrgInsertInput> = {}
): TaxonomyOrgInsertInput => {
  return {
    ...defaultTaxonomyOrg,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
