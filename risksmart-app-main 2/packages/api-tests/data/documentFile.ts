import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { DocumentFileInsertInput } from '../generated/graphql';
import { VersionStatusEnum } from '../generated/graphql';

const defaultDocumentFile: DocumentFileInsertInput = {
  Status: VersionStatusEnum.Draft,
  Version: '1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: '2023-12-07T13:51:51.833+00:00',
};

export const buildDocumentFile = (
  overrides: Partial<DocumentFileInsertInput> = {}
): DocumentFileInsertInput => {
  return {
    ...defaultDocumentFile,
    Id: randomUUID(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
