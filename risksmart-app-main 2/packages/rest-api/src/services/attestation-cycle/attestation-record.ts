import dayjs from 'dayjs';
import z from 'zod';

import { attestationConfigIdSchema } from './attestation-config';
import type { AttestationCycle } from './attestation-cycle';
import { documentFileIdSchema } from './document-file';
import { attestationCycleIdSchema } from './types';
import { type UserId, userIdSchema } from './user';

export const attestationRecordIdSchema = z
  .string()
  .uuid()
  .brand('AttestationRecordId');
export type AttestationRecordId = z.infer<typeof attestationRecordIdSchema>;

const attestationStatusEnumSchema = z.enum([
  'attested',
  'expired',
  'not_attested',
  'not_required',
  'pending',
]);

export const attestationRecordSchema = z.object({
  id: attestationRecordIdSchema,
  userId: userIdSchema,
  status: attestationStatusEnumSchema,
  active: z.boolean(),
  expiresAt: z.string().nullable(),
  attestedAt: z.string().nullish(),
  cycleId: attestationCycleIdSchema,
  documentFileId: documentFileIdSchema,
  configId: attestationConfigIdSchema,
  carriedForwardFromRecordId: attestationRecordIdSchema.nullable(),
});

export type AttestationRecord = Readonly<
  z.infer<typeof attestationRecordSchema>
>;

export const attestedAttestationRecordSchema = attestationRecordSchema.extend({
  status: z.literal('attested'),
  attestedAt: z.string(),
});

export type AttestedAttestationRecord = Readonly<
  z.infer<typeof attestedAttestationRecordSchema>
>;

const _pendingAttestationRecordSchema = attestationRecordSchema.extend({
  status: z.literal('pending'),
  attestedAt: z.null(),
  id: z.null().optional(),
});

export type CreateAttestationRecord = z.infer<
  typeof _pendingAttestationRecordSchema
>;

export const createAttestationRecord = (props: {
  attestationCycle: AttestationCycle;
  userId: UserId;
}): CreateAttestationRecord => {
  const expirationDate = props.attestationCycle.config.timeLimitMs
    ? dayjs().add(props.attestationCycle.config.timeLimitMs, 'ms').toISOString()
    : null;

  const record: CreateAttestationRecord = {
    status: 'pending',
    active: true,
    expiresAt: expirationDate,
    attestedAt: null,
    cycleId: props.attestationCycle.id,
    documentFileId: props.attestationCycle.parentId,
    userId: props.userId,
    configId: props.attestationCycle.config.id,
    carriedForwardFromRecordId: null,
  };

  return record;
};

export const carryForwardFromRecord = <
  T extends CreateAttestationRecord | AttestationRecord,
>(
  record: T,
  carriedForwardFromRecord: AttestedAttestationRecord
): T => {
  if (carriedForwardFromRecord.status !== 'attested') {
    throw new Error(
      `Attestation record with status '${carriedForwardFromRecord.status}' cannot be carried forward.`
    );
  }

  return {
    ...asAttested(record, carriedForwardFromRecord.attestedAt),
    carriedForwardFromRecordId: carriedForwardFromRecord.id,
  };
};

const canBeAttested = (
  record: CreateAttestationRecord | AttestationRecord
): boolean => {
  return record.status === 'pending';
};

export const canBeActivated = (record: AttestationRecord): boolean => {
  if (record.status === 'attested' && !record.active) {
    return true;
  }

  if (record.status === 'not_required') {
    return true;
  }

  return false;
};

export const asActive = (record: AttestationRecord): AttestationRecord => {
  if (!canBeActivated(record)) {
    throw new Error(
      `Attestation record with status '${record.status}' cannot be marked as active.`
    );
  }

  if (record.status === 'attested') {
    return {
      ...record,
      active: true,
    };
  }

  return {
    ...record,
    status: 'pending',
    active: true,
  };
};

export const isInactive = (record: AttestationRecord): boolean => {
  return record.active === false;
};

export const asInactive = (record: AttestationRecord): AttestationRecord => {
  if (record.status === 'pending') {
    return { ...record, status: 'not_required', active: false };
  }

  return { ...record, active: false };
};

const asAttested = <T extends CreateAttestationRecord | AttestationRecord>(
  record: T,
  attestedAt: string | null | undefined
): T => {
  if (!canBeAttested(record)) {
    throw new Error(
      `Attestation record with status '${record.status}' cannot be marked as attested.`
    );
  }

  return {
    ...record,
    status: 'attested',
    attestedAt: attestedAt || dayjs().toISOString(),
  };
};
