import { getLogger } from 'src/logger';
import z from 'zod';

import {
  type AttestationCycle,
  isConcludedAttestationCycle,
  isUserInUserGroupAudience,
} from '../attestation-cycle';
import {
  asInactive,
  type AttestationRecord,
  isInactive,
} from '../attestation-record';
import { userIdSchema } from '../user';
import { type UserGroupId, userGroupIdSchema } from '../user-group';

const logger = getLogger();

const _removeUserFromAudienceCommandSchema = z.object({
  userId: userIdSchema,
  userGroupId: userGroupIdSchema.nullable(),
});

export type RemoveUserFromAudienceCommand = Readonly<
  z.infer<typeof _removeUserFromAudienceCommandSchema>
>;

interface RemoveUserFromAudienceCommandHandler {
  execute(command: RemoveUserFromAudienceCommand): Promise<void>;
}
interface Dependencies {
  attestationCycleReader: () => Promise<AttestationCycle[]>;
  attestationCycleByUserGroupReader: (
    userGroups: UserGroupId[]
  ) => Promise<AttestationCycle[]>;
  attestationRecordStatusWriter: (
    attestationRecords: AttestationRecord[]
  ) => Promise<{ affectedCount: number }>;
}

export const removeUserFromAudienceCommandHandler = ({
  attestationCycleReader,
  attestationCycleByUserGroupReader,
  attestationRecordStatusWriter,
}: Dependencies): RemoveUserFromAudienceCommandHandler => {
  const execute = async ({
    userId,
    userGroupId,
  }: RemoveUserFromAudienceCommand) => {
    let attestationCycles = userGroupId
      ? await attestationCycleByUserGroupReader([userGroupId])
      : await attestationCycleReader();

    if (attestationCycles.length === 0) {
      logger.info(
        'No attestation cycles found for provided user groups, skipping removal from attestation audiences',
        {
          userId,
          userGroupId: userGroupId,
        }
      );

      return;
    }

    attestationCycles = attestationCycles.filter(
      (cycle) => !isConcludedAttestationCycle(cycle)
    );

    if (userGroupId) {
      attestationCycles = attestationCycles.filter(
        (cycle) => !isUserInUserGroupAudience(cycle.audience, userId)
      );
    }

    if (attestationCycles.length === 0) {
      logger.info(
        'User is still required for all attestation cycles, skipping removal from attestation audiences',
        {
          userId,
          attestationCycleIds: attestationCycles.map((c) => c.id),
        }
      );

      return;
    }

    logger.info(
      'Removing user from attestation audiences for attestation cycles where they are no longer required',
      {
        userId,
        attestationCycleIds: attestationCycles.map((c) => c.id),
      }
    );

    const recordsToUpdate: AttestationRecord[] = attestationCycles.flatMap(
      (cycle) =>
        cycle.records
          .filter((record) => record.userId === userId && !isInactive(record))
          .map(asInactive)
    );

    if (recordsToUpdate.length === 0) {
      logger.info(
        'No attestation records found for user in attestation cycles, skipping removal from attestation audiences',
        {
          userId,
          attestationCycleIds: attestationCycles.map((c) => c.id),
        }
      );

      return;
    }

    const { affectedCount } =
      await attestationRecordStatusWriter(recordsToUpdate);

    if (affectedCount !== recordsToUpdate.length) {
      logger.warn(
        'Mismatch in number of attestation records updated when removing user from attestation audiences',
        {
          userId,
          expectedCount: recordsToUpdate.length,
          affectedCount,
        }
      );
    } else {
      logger.info(
        'Successfully marked attestation records as not required for user removal from attestation audiences',
        {
          userId,
          affectedCount,
        }
      );
    }
  };

  return { execute };
};
