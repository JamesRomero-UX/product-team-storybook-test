import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { InternalAuditEntityInsertInput } from '../generated/graphql';

const defaultInternalAudit: InternalAuditEntityInsertInput = {
  Title: 'Internal Audit 1',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildInternalAudit = (
  overrides: Partial<InternalAuditEntityInsertInput> = {}
): InternalAuditEntityInsertInput => {
  return {
    ...defaultInternalAudit,
    businessArea: {
      data: {
        Title: 'Business Area 1',
        OrgKey: getDefaultOrgId(),
        CreatedAtTimestamp: undefined,
        CreatedByUser: getDefaultUserId(),
        ModifiedAtTimestamp: undefined,
        ModifiedByUser: getDefaultUserId(),
      },
    },
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    ModifiedByUser: getDefaultUserId(),
    CreatedByUser: getDefaultUserId(),
    ...overrides,
  };
};
