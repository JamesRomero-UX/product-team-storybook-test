import { getLogger } from 'src/logger';
import z from 'zod';

import {
  asInactive,
  type AttestationRecord,
  type AttestationRecordId,
  attestationRecordIdSchema,
} from '../attestation-record';

const logger = getLogger();

interface Dependencies {
  attestationRecordReader: (
    attestationRecordIds: AttestationRecordId[]
  ) => Promise<AttestationRecord[]>;

  attestationRecordStatusWriter: (
    attestationRecords: AttestationRecord[]
  ) => Promise<{ affectedCount: number }>;
}

const _concludeActiveCycleCommandSchema = z.object({
  attestationRecordIds: attestationRecordIdSchema.array(),
});

export type MarkAttestationRecordsNotRequiredCommand = Readonly<
  z.infer<typeof _concludeActiveCycleCommandSchema>
>;

export const markAttestationRecordsNotRequiredCommandHandler = ({
  attestationRecordReader,
  attestationRecordStatusWriter,
}: Dependencies) => ({
  execute: async (
    command: MarkAttestationRecordsNotRequiredCommand
  ): Promise<{ affectedCount: number }> => {
    const uniqueIds = Array.from(new Set(command.attestationRecordIds));

    const attestationRecords = await attestationRecordReader(uniqueIds);

    if (attestationRecords.length !== uniqueIds.length) {
      logger.warn(
        'Some attestation records were not found. Cancelling operation',
        {
          expected: uniqueIds,
          actual: attestationRecords,
        }
      );

      throw new Error('Failed to mark all attestation records as not required');
    }

    const inactiveRecords = attestationRecords.map(asInactive);

    const { affectedCount } =
      await attestationRecordStatusWriter(inactiveRecords);

    if (affectedCount !== inactiveRecords.length) {
      logger.error('Not all attestation records were marked as not required', {
        expected: inactiveRecords.length,
        actual: affectedCount,
      });

      throw new Error('Failed to mark all attestation records as not required');
    }

    logger.info('Marked attestation records as not required', {
      affectedCount,
    });

    return { affectedCount };
  },
});
