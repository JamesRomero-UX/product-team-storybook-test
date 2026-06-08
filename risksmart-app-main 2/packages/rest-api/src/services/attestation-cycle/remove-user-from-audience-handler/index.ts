import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import type { AttestationRecord } from '../attestation-record';
import { removeUserFromAudienceCommandHandler as handler } from './remove-user-from-audience-handler';

export const createRemoveUserFromAudienceCommandHandler = (
  opts: ServiceOptions
) => {
  const {
    getByUserGroup: attestationCycleByUserGroupReader,
    getAllActive: attestationCycleReader,
  } = AttestationCycleDataAdaptor(opts);

  const attestationRecordService = AttestationRecordService(opts);

  const attestationRecordStatusWriter = async (
    attestationRecords: AttestationRecord[]
  ): Promise<{ affectedCount: number }> => {
    const results = await Promise.all(
      attestationRecords.map(async (record) => {
        const res = await attestationRecordService.updateRecords(
          {
            Id: { _eq: record.id },
          },
          {
            AttestationStatus: record.status,
            Active: record.active,
          }
        );

        return res ?? 0;
      })
    );

    return { affectedCount: results.reduce((sum, count) => sum + count, 0) };
  };

  return handler({
    attestationCycleReader,
    attestationCycleByUserGroupReader,
    attestationRecordStatusWriter,
  });
};
