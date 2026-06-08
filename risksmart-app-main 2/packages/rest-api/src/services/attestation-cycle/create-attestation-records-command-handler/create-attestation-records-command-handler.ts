import { getLogger } from 'src/logger';

import { type AttestationCycle, calculateAudience } from '../attestation-cycle';
import type {
  AttestedAttestationRecord,
  CreateAttestationRecord,
} from '../attestation-record';
import {
  attestedAttestationRecordSchema,
  carryForwardFromRecord,
  createAttestationRecord,
} from '../attestation-record';
import type { AttestationCycleId } from '../types';
import type { UserId } from '../user';

const logger = getLogger();

export type CreateAttestationRecordsCommand = Readonly<{
  attestationCycleId: AttestationCycleId;
}>;

interface CreateAttestationRecordsCommandHandler {
  execute(command: CreateAttestationRecordsCommand): Promise<void>;
}

interface Dependencies {
  globalUserReader: () => Promise<UserId[]>;
  attestationRecordsWriter: (
    pendingAttestationRecords: CreateAttestationRecord[]
  ) => Promise<{ affectedCount: number }>;
  previousAttestationCycleReader: (
    attestationCycle: AttestationCycle
  ) => Promise<AttestationCycle | null>;
  attestationCycleByIdReader: (
    attestationCycleId: AttestationCycleId
  ) => Promise<AttestationCycle>;
}

export const createAttestationRecordsCommandHandler = ({
  globalUserReader,
  attestationRecordsWriter,
  previousAttestationCycleReader,
  attestationCycleByIdReader,
}: Dependencies): CreateAttestationRecordsCommandHandler => {
  const execute = async (command: CreateAttestationRecordsCommand) => {
    const attestationCycle = await attestationCycleByIdReader(
      command.attestationCycleId
    );

    const previousCycleAttestedRecords =
      await getAttestedRecordsFromPreviousCycle(attestationCycle);

    const userIds = attestationCycle.audience.global
      ? await globalUserReader()
      : calculateAudience(attestationCycle.audience);

    if (userIds.length === 0) {
      logger.info('No users found in attestation cycle audience.', {
        attestationCycleId: attestationCycle.id,
        documentFileId: attestationCycle.parentId,
      });

      return;
    }

    const createAttestationRecords: CreateAttestationRecord[] = userIds.map(
      (userId) => {
        const input = createAttestationRecord({
          attestationCycle,
          userId,
        });

        const carryForwardRecord = previousCycleAttestedRecords.find(
          (record) => record.userId === userId
        );

        if (carryForwardRecord) {
          return carryForwardFromRecord(input, carryForwardRecord);
        }

        return input;
      }
    );

    const result = await attestationRecordsWriter(createAttestationRecords);

    logger.info(`created attestation records.`, {
      expected: createAttestationRecords.length,
      actual: result.affectedCount,
      attestationCycleId: attestationCycle.id,
      documentFileId: attestationCycle.parentId,
    });
  };

  const getAttestedRecordsFromPreviousCycle = async (
    attestationCycle: AttestationCycle
  ): Promise<Array<AttestedAttestationRecord>> => {
    if (attestationCycle.allowCarryForward) {
      const previousAttestationCycle =
        await previousAttestationCycleReader(attestationCycle);

      if (!previousAttestationCycle) {
        logger.info(
          'No previous attestation cycle found to carry forward records from.',
          {
            attestationCycleId: attestationCycle.id,
            documentFileId: attestationCycle.parentId,
          }
        );

        return [];
      }

      const attestedRecords = previousAttestationCycle.records
        .filter((record) => record.status === 'attested')
        .map((record) => attestedAttestationRecordSchema.parse(record));

      logger.info('Carrying forward attestation records from previous cycle.', {
        attestationCycleId: attestationCycle.id,
        previousAttestationCycleId: previousAttestationCycle.id,
        carriedForwardCount: attestedRecords.length,
      });

      return attestedRecords;
    }

    return [];
  };

  return { execute };
};
