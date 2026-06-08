import { randomUUID } from 'node:crypto';

import type { AttestationConfig } from 'src/services/attestation-cycle/attestation-config';
import {
  asConcludedNaturally,
  type AttestationCycle,
  attestationCycleSchema,
} from 'src/services/attestation-cycle/attestation-cycle';
import type { AttestationRecord } from 'src/services/attestation-cycle/attestation-record';
import { documentIdSchema } from 'src/services/attestation-cycle/document';
import { documentFileIdSchema } from 'src/services/attestation-cycle/document-file';
import type { UserGroup } from 'src/services/attestation-cycle/user-group';

type AttestationCycleBuilder = (item: AttestationCycle) => AttestationCycle;

const getDefaultCycle = (): AttestationCycle =>
  attestationCycleSchema.parse({
    id: randomUUID(),
    status: 'active',
    allowCarryForward: false,
    parentId: randomUUID(),
    createdAtTimestamp: '',
    createdByUser: '',
    records: [],
    audience: {
      global: true,
      userGroups: [],
    },
    config: {
      id: randomUUID(),
      timeLimitMs: null,
    },
    concludedAtTimestamp: null,
    policy: {
      id: randomUUID(),
      version: { id: randomUUID() },
    },
  });

export const buildAttestationCycle = (
  ...builders: AttestationCycleBuilder[]
): AttestationCycle => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultCycle()
  );

  return item;
};

export const withGlobalAudience = (): AttestationCycleBuilder => (item) => ({
  ...item,
  audience: {
    global: true,
    userGroups: [],
  },
});

export const withUserGroupsAudience =
  (userGroups: UserGroup[]): AttestationCycleBuilder =>
  (item) => ({
    ...item,
    audience: {
      global: false,
      userGroups,
    },
  });

export const withConcludedNaturallyState =
  (): AttestationCycleBuilder => (item) =>
    asConcludedNaturally(item);

export const withAllowCarryForward = (): AttestationCycleBuilder => (item) => ({
  ...item,
  allowCarryForward: true,
});

export const withRecords =
  (records: AttestationRecord[]): AttestationCycleBuilder =>
  (item) => ({
    ...item,
    records: [...item.records, ...records],
  });

export const withConfig =
  (config: AttestationConfig): AttestationCycleBuilder =>
  (item) => ({
    ...item,
    config,
  });

export const withPolicy =
  (policy: { id: string; version: { id: string } }): AttestationCycleBuilder =>
  (item) => ({
    ...item,
    policy: {
      id: documentIdSchema.parse(policy.id),
      version: {
        id: documentFileIdSchema.parse(policy.version.id),
      },
    },
  });
