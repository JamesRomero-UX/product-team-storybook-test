import dayjs from 'dayjs';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  AttestationConfigInsertInput,
  AttestationRecordInsertInput,
} from '../generated/graphql';
import { AttestationRecordStatusEnum } from '../generated/graphql';

const defaultAttestationConfig: AttestationConfigInsertInput = {
  RequireGlobalAttestation: false,
  AttestationTimeLimit: '1 year',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

const defaultAttestationRecord: AttestationRecordInsertInput = {
  AttestationStatus: AttestationRecordStatusEnum.Pending,
  Active: true,
  ExpiresAt: dayjs().add(1, 'year').toISOString(),
  AttestedAt: null,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildAttestationConfig = (
  overrides: Partial<AttestationConfigInsertInput> = {}
): AttestationConfigInsertInput => {
  return {
    ...defaultAttestationConfig,
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};

export const buildAttestationRecord = (
  overrides: Partial<AttestationRecordInsertInput> = {}
): AttestationRecordInsertInput => {
  return {
    ...defaultAttestationRecord,
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    UserId: getDefaultUserId(),
    OrgKey: getDefaultOrgId(),
    ...overrides,
  };
};
