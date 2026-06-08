import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { InternalAuditResultParentInsertInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const internalAuditResultParent: InternalAuditResultParentInsertInput = {
  ParentType: ParentTypeEnum.InternalAuditReport,
  ResultType: ParentTypeEnum.Risk,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
};

export const buildInternalAuditResultParent = (
  overrides: Partial<InternalAuditResultParentInsertInput> = {}
): InternalAuditResultParentInsertInput => {
  return {
    ...internalAuditResultParent,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};
