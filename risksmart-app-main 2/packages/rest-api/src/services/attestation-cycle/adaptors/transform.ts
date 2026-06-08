import type { GetAttestationCyclesQuery } from 'generated/graphql';
import type z from 'zod';

import {
  type AttestationConfig,
  attestationConfigIdSchema,
} from '../attestation-config';
import {
  type AttestationCycle,
  attestationCycleSchema,
} from '../attestation-cycle';
import type { AttestationRecord } from '../attestation-record';
import { attestationRecordSchema } from '../attestation-record';

type AttestationRecordData =
  GetAttestationCyclesQuery['attestation_cycle'][0]['records'][0];
type AttestationCycleData =
  GetAttestationCyclesQuery['attestation_cycle'][number];

export const transformAttestationCycleFromData = (
  data: AttestationCycleData
): AttestationCycle => {
  if (!data) {
    throw new Error('No data provided to transformAttestationCycleFromData');
  }

  return attestationCycleSchema.parse({
    id: data.Id,
    allowCarryForward: data.AllowCarryForward,
    createdAtTimestamp: data.CreatedAtTimestamp,
    createdByUser: data.CreatedByUser,
    modifiedAtTimestamp: data.ModifiedAtTimestamp,
    modifiedByUser: data.ModifiedByUser,
    parentId: data.ParentId,
    status: data.Status,
    records:
      data.records?.map((record) =>
        transformAttestationRecordFromData(record)
      ) ?? [],
    audience: transformAudienceFromData(data),
    config: transformConfigFromData(data),
    concludedAtTimestamp: data.ConcludedAtTimestamp,
    policy: transformPolicyFromData(data),
  } satisfies Record<keyof z.input<typeof attestationCycleSchema>, unknown>);
};

const transformPolicyFromData = (
  data: AttestationCycleData
): { id: string; version: { id: string } } => {
  const attestationConfig = data.parent.parent?.attestationConfig;

  if (!attestationConfig) {
    throw new Error(
      `Attestation config data is missing. AttestationCycleId: ${data.Id}`
    );
  }

  return {
    id: attestationConfig.ParentId,
    version: {
      id: data.ParentId,
    },
  };
};

export const transformConfigFromData = (
  data: AttestationCycleData
): AttestationConfig => {
  const attestationConfig = data.parent.parent?.attestationConfig;

  if (!attestationConfig) {
    throw new Error(
      `Attestation config data is missing. AttestationCycleId: ${data.Id}`
    );
  }

  return {
    id: attestationConfigIdSchema.parse(attestationConfig.ParentId),
    timeLimitMs: attestationConfig.timeLimitMs,
  } satisfies AttestationConfig;
};

export const transformAttestationRecordFromData = (
  record: AttestationRecordData
): AttestationRecord => {
  return attestationRecordSchema.parse({
    id: record.Id,
    status: record.AttestationStatus,
    active: record.Active,
    expiresAt: record.ExpiresAt,
    attestedAt: record.AttestedAt,
    cycleId: record.CycleId,
    documentFileId: record.NodeId,
    configId: record.ConfigId,
    userId: record.UserId,
    carriedForwardFromRecordId: record.CarriedForwardFromRecordId,
  } satisfies Record<keyof z.input<typeof attestationRecordSchema>, unknown>);
};

export const transformAudienceFromData = (data: AttestationCycleData) => {
  const attestationConfig = data.parent.parent?.attestationConfig;

  if (!attestationConfig) {
    throw new Error(
      `Attestation config data is missing. AttestationCycleId: ${data.Id}`
    );
  }

  if (attestationConfig.RequireGlobalAttestation) {
    return {
      global: true as const,
      userGroups: [],
    };
  }

  return {
    global: false as const,
    userGroups: attestationConfig.groups.map((group) => ({
      id: group.group.Id,
      name: group.group.Name,
      users: group.group.users.map((user) => user.UserId),
    })),
  };
};
