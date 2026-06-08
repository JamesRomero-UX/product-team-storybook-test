import { getLogger } from 'src/logger';
import z from 'zod';

import type { AttestationCycle } from '../attestation-cycle';
import type {
  AttestationRecord,
  AttestationRecordId,
  CreateAttestationRecord,
} from '../attestation-record';
import {
  asActive,
  canBeActivated,
  createAttestationRecord,
} from '../attestation-record';
import { userIdSchema } from '../user';
import type { UserGroupId } from '../user-group';
import { userGroupIdSchema } from '../user-group';

const logger = getLogger();

const _addUserToAudienceCommandSchema = z.object({
  userId: userIdSchema,
  userGroupId: userGroupIdSchema.nullable(),
});

export type AddUserToAudienceCommand = Readonly<
  z.infer<typeof _addUserToAudienceCommandSchema>
>;

interface AddUserToAudienceCommandHandler {
  execute(command: AddUserToAudienceCommand): Promise<void>;
}

interface Dependencies {
  globalAttestationCycleReader: () => Promise<AttestationCycle[]>;

  attestationCycleByUserGroupReader: (
    userGroups: UserGroupId[]
  ) => Promise<AttestationCycle[]>;

  createAttestationRecordWriter: (
    attestationRecord: CreateAttestationRecord
  ) => Promise<AttestationRecordId>;

  updateAttestationRecordStatusWriter: (
    attestationRecord: AttestationRecord
  ) => Promise<void>;
}

export const addUserToAudienceCommandHandler = ({
  globalAttestationCycleReader,
  attestationCycleByUserGroupReader,
  createAttestationRecordWriter,
  updateAttestationRecordStatusWriter,
}: Dependencies): AddUserToAudienceCommandHandler => {
  const execute = async ({
    userId,
    userGroupId,
  }: AddUserToAudienceCommand): Promise<void> => {
    const cycles = userGroupId
      ? await attestationCycleByUserGroupReader([userGroupId])
      : await globalAttestationCycleReader();

    // for each cycle, check for attestation record
    for (const cycle of cycles) {
      const record = cycle.records.find((r) => r.userId === userId);

      // if no record, create (pending)
      if (!record) {
        const newRecord = createAttestationRecord({
          attestationCycle: cycle,
          userId,
        });

        await createAttestationRecordWriter(newRecord);
        continue;
      }

      if (canBeActivated(record)) {
        const activatedRecord = asActive(record);
        await updateAttestationRecordStatusWriter(activatedRecord);
        continue;
      }

      logger.error(`Unexpected attestation record status`, {
        userId,
        status: record.status,
        recordId: record.id,
      });

      // throw on other status becasue this shouldnt happen
      throw new Error(`Unexpected attestation record status`);
    }
  };

  return {
    execute,
  };
};
