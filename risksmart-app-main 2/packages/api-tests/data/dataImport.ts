import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { DataImportInsertInput } from '../generated/graphql';
import { DataImportStatusEnum } from '../generated/graphql';

const defaultDataImport: DataImportInsertInput = {
  Status: DataImportStatusEnum.Notstarted,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildDataImport = (
  overrides: Partial<DataImportInsertInput> = {}
): DataImportInsertInput => {
  return {
    ...defaultDataImport,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
