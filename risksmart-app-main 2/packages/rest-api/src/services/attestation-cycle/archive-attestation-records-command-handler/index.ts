import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import type { ServiceOptions } from 'src/services/types';

import { AttestationCycleDataAdaptor } from '../adaptors/attestation-cycle-data-adaptor';
import type { AttestationRecordPatch } from './archive-attestation-records-command-handler';
import { archiveAttestationRecordsCommandHandler as handler } from './archive-attestation-records-command-handler';

export const createArchiveAttestationRecordsCommandHandler = (
  opts: ServiceOptions
) => {
  const attestationRecordService = AttestationRecordService(opts);
  const { getById: attestationCycleByIdReader } =
    AttestationCycleDataAdaptor(opts);

  const attestationRecordWriter = async (
    recordIds: string[],
    patch: AttestationRecordPatch
  ): Promise<{ affectedCount: number }> => {
    if (recordIds.length === 0) {
      return { affectedCount: 0 };
    }

    const affectedCount = await attestationRecordService.updateRecords(
      {
        Id: { _in: recordIds },
      },
      {
        Active: patch.active,
        ...(patch.status && { AttestationStatus: patch.status }),
      }
    );

    return { affectedCount };
  };

  return handler({
    attestationRecordWriter,
    attestationCycleByIdReader,
  });
};
