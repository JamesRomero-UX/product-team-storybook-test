import { AttestationRecordStatus } from '@risksmart-app/domain/src/types/consts/attestation-record-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAttestationRecord = ({
  orgkey,
  userId,
  nodeId,
  configId,
  overrides,
}: {
  orgkey: string;
  userId: string;
  nodeId: string;
  configId?: string;
  overrides?: Partial<InferInsertModel<'attestation_record'>>;
}): InferInsertModel<'attestation_record'> => ({
  Id: randomUUID(),
  UserId: userId,
  Active: true,
  AttestationStatus: AttestationRecordStatus.Pending,
  AttestedAt: null,
  ExpiresAt: null,
  OrgKey: orgkey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  NodeId: nodeId,
  ConfigId: configId ?? null,
  CycleId: null,
  ...overrides,
});
