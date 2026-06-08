import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { AttestationGroupInsertInput } from '../generated/graphql';

const defaultAttestationGroup: AttestationGroupInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildAttestationGroup = (
  overrides: Partial<AttestationGroupInsertInput> = {}
): AttestationGroupInsertInput => {
  return {
    ...defaultAttestationGroup,
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
