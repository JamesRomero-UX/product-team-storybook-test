import type { ServiceOptions } from 'src/services/types';

import { AttestationRecordAdaptor } from '../adaptors/attestation-record-adaptor';
import type { AttestationRecord } from '../attestation-record';
import { markAttestationRecordsNotRequiredCommandHandler as handler } from './mark-attestation-records-not-required-command-handler';

export const createMarkAttestationRecordsNotRequiredCommandHandler = (
  opts: ServiceOptions
) => {
  const { getManyByIds: attestationRecordReader, updateStatus } =
    AttestationRecordAdaptor(opts);

  const attestationRecordStatusWriter = async (
    attestationRecords: AttestationRecord[]
  ): Promise<{ affectedCount: number }> => {
    let affectedCount = 0;

    // it would be better to do this in bulk but the handler makes disparate updates to the records
    // depending on their current state. Another option might be to do two separate update calls from the handler.
    // given this should only be a small number of records this is probably acceptable for now.
    for (const record of attestationRecords) {
      await updateStatus(record);
      affectedCount += 1;
    }

    return { affectedCount };
  };

  return handler({
    attestationRecordReader,
    attestationRecordStatusWriter,
  });
};
