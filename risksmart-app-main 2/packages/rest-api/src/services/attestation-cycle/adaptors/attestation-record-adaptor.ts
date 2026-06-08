import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import type { ServiceOptions } from 'src/services/types';

import type {
  AttestationRecordId,
  CreateAttestationRecord,
} from '../attestation-record';
import {
  type AttestationRecord,
  attestationRecordIdSchema,
} from '../attestation-record';
import { transformAttestationRecordFromData } from './transform';

export const AttestationRecordAdaptor = (opts: ServiceOptions) => {
  const service = AttestationRecordService(opts);

  return {
    create: async (
      record: CreateAttestationRecord
    ): Promise<AttestationRecordId> => {
      const result = await service.createAttestationRecord([
        {
          userId: record.userId,
          nodeId: record.documentFileId,
          configId: record.configId,
          status: record.status,
          active: record.active,
          expirationDate: record.expiresAt,
          cycleId: record.cycleId,
          carriedForwardFromRecordId: record.carriedForwardFromRecordId,
          attestedAt: record.attestedAt,
        },
      ]);

      return attestationRecordIdSchema.parse(result.createdRecords[0]);
    },

    updateStatus: async (record: AttestationRecord): Promise<void> => {
      await service.updateRecords(
        {
          Id: { _eq: record.id },
        },
        {
          Active: record.active,
          AttestationStatus: record.status,
        }
      );
    },

    getManyByIds: async (
      ids: AttestationRecordId[]
    ): Promise<AttestationRecord[]> => {
      const records = await service.getAttestationRecords({
        Id: { _in: ids },
      });

      return records.map(transformAttestationRecordFromData);
    },
  };
};
