import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IngestionConfigInsertInput } from '../generated/graphql';

const defaultIngestionConfig: IngestionConfigInsertInput = {
  IngestionConfig: {},
  SecretArn: undefined,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildIngestionConfig = (
  overrides: Partial<IngestionConfigInsertInput> = {}
): IngestionConfigInsertInput => {
  return {
    ...defaultIngestionConfig,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
