import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { CustomDatasourceInsertInput } from '../generated/graphql';

const defaultCustomDatasource: CustomDatasourceInsertInput = {
  Datasources: [],
  Fields: [],
  Filters: [],
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
  ModifiedAtTimestamp: '2021-02-01T00:00:00Z',
  Title: 'Custom data source 1',
};

export const buildCustomDatasource = (
  overrides: Partial<CustomDatasourceInsertInput> = {}
): CustomDatasourceInsertInput => {
  return {
    ...defaultCustomDatasource,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
