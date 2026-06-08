import { getLogger } from 'src/logger';
import z from 'zod';

import type { AttestationCycle } from '../attestation-cycle';
import { canBeArchived } from '../attestation-cycle';
import { type AttestationRecordId } from '../attestation-record';
import type { AttestationCycleId } from '../types';

const logger = getLogger();

const _attestationRecordPatchSchema = z.object({
  active: z.boolean().optional(),
  status: z.enum(['not_attested', 'not_required', 'expired']).optional(),
});

export type AttestationRecordPatch = z.infer<
  typeof _attestationRecordPatchSchema
>;

interface Dependencies {
  attestationRecordWriter: (
    attestationRecordIds: AttestationRecordId[],
    patch: AttestationRecordPatch
  ) => Promise<{ affectedCount: number }>;

  attestationCycleByIdReader: (
    id: AttestationCycleId
  ) => Promise<AttestationCycle>;
}

export type ArchiveAttestationRecordsCommand = Readonly<{
  attestationCycleId: AttestationCycleId;
}>;

export const archiveAttestationRecordsCommandHandler = ({
  attestationRecordWriter,
  attestationCycleByIdReader,
}: Dependencies) => ({
  execute: async ({
    attestationCycleId,
  }: ArchiveAttestationRecordsCommand): Promise<void> => {
    const attestationCycle =
      await attestationCycleByIdReader(attestationCycleId);

    if (!canBeArchived(attestationCycle)) {
      logger.warn(
        `Cannot archive attestation records for cycle with status ${attestationCycle.status}`
      );

      return;
    }

    const notAttestedRecordIds = attestationCycle.records
      .filter((r) => r.active && r.status !== 'attested')
      .map((r) => r.id);

    const attestedRecordIds = attestationCycle.records
      .filter((r) => r.active && r.status === 'attested')
      .map((r) => r.id);

    const notAttestedResult =
      notAttestedRecordIds.length > 0
        ? await attestationRecordWriter(notAttestedRecordIds, {
            active: false,
            status: 'not_attested',
          })
        : { affectedCount: 0 };

    const attestedResult =
      attestedRecordIds.length > 0
        ? await attestationRecordWriter(attestedRecordIds, {
            active: false,
          })
        : { affectedCount: 0 };

    const totalCount =
      notAttestedResult.affectedCount + attestedResult.affectedCount;

    logger.info('Archived attestation records', {
      notAttestedCount: notAttestedResult.affectedCount,
      attestedCount: attestedResult.affectedCount,
      totalCount,
    });
  },
});
