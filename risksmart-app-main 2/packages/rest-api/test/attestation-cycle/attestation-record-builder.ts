import { randomUUID } from 'node:crypto';

import {
  type AttestationRecord,
  attestationRecordSchema,
} from 'src/services/attestation-cycle/attestation-record';
import type { UserId } from 'src/services/attestation-cycle/user';

type AttestationRecordBuilder = (item: AttestationRecord) => AttestationRecord;

const getDefaultRecord = () =>
  attestationRecordSchema.parse({
    id: randomUUID(),
    userId: `user|${randomUUID()}`,
    status: 'pending',
    active: true,
    expiresAt: null,
    attestedAt: null,
    cycleId: randomUUID(),
    documentFileId: randomUUID(),
    configId: randomUUID(),
    carriedForwardFromRecordId: null,
  });

export const buildAttestationRecord = (
  ...builders: AttestationRecordBuilder[]
): AttestationRecord => {
  const item = builders.reduce(
    (acc, builder) => builder(acc),
    getDefaultRecord()
  );

  return item;
};

export const withUserId =
  (userId: string): AttestationRecordBuilder =>
  (item) => ({
    ...item,
    userId: userId as UserId,
  });

export const withAttestedState = (): AttestationRecordBuilder => (item) => {
  return {
    ...item,
    status: 'attested',
    attestedAt: '2024-01-01T00:00:00.000Z',
  };
};

export const withNotRequiredState = (): AttestationRecordBuilder => (item) => {
  return { ...item, status: 'not_required', active: false };
};
