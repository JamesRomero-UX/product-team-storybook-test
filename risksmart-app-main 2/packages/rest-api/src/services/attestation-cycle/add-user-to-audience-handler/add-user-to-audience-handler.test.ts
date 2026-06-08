import {
  buildAttestationCycle,
  withGlobalAudience,
  withRecords,
  withUserGroupsAudience,
} from 'test/attestation-cycle/attestation-cycle-builder';
import {
  buildAttestationRecord,
  withAttestedState,
  withNotRequiredState,
  withUserId,
} from 'test/attestation-cycle/attestation-record-builder';

import { userIdSchema } from '../user';
import type { UserGroup } from '../user-group';
import { userGroupIdSchema } from '../user-group';
import type { AddUserToAudienceCommand } from './add-user-to-audience-handler';
import { addUserToAudienceCommandHandler } from './add-user-to-audience-handler';

describe('add user to audience command handler', () => {
  describe('when no user group id is provided', () => {
    it('should add the user to all global attestation cycles', async () => {
      const userId = userIdSchema.parse('00000000-0000-0000-0000-000000000001');

      const globalCycle1 = buildAttestationCycle(
        withGlobalAudience(),
        withRecords([])
      );

      const globalCycle2 = buildAttestationCycle(
        withGlobalAudience(),
        withRecords([])
      );

      const mockGlobalAttestationCycleReader = vi
        .fn()
        .mockResolvedValue([globalCycle1, globalCycle2]);
      const mockCreateAttestationRecordWriter = vi.fn();
      const mockUpdateAttestationRecordStatusWriter = vi.fn();

      const handler = addUserToAudienceCommandHandler({
        globalAttestationCycleReader: mockGlobalAttestationCycleReader,
        attestationCycleByUserGroupReader: vi.fn(),
        createAttestationRecordWriter: mockCreateAttestationRecordWriter,
        updateAttestationRecordStatusWriter:
          mockUpdateAttestationRecordStatusWriter,
      });

      const command: AddUserToAudienceCommand = {
        userId,
        userGroupId: null,
      };

      await handler.execute(command);

      expect(mockGlobalAttestationCycleReader).toHaveBeenCalledOnce();

      expect(mockCreateAttestationRecordWriter).toHaveBeenCalledTimes(2);
      expect(mockCreateAttestationRecordWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          cycleId: globalCycle1.id,
          status: 'pending',
          active: true,
        })
      );

      expect(mockCreateAttestationRecordWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          cycleId: globalCycle2.id,
          status: 'pending',
          active: true,
        })
      );

      expect(mockUpdateAttestationRecordStatusWriter).not.toHaveBeenCalled();
    });
  });

  describe('when user group is provided', () => {
    it('should add user to attestation cycles for specified user group', async () => {
      const userId = userIdSchema.parse('00000000-0000-0000-0000-000000000001');

      const userGroup: UserGroup = {
        id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
        name: 'Group 1',
        users: [userId],
      };

      const attestationCycle = buildAttestationCycle(
        withUserGroupsAudience([userGroup]),
        withRecords([])
      );

      const mockAttestationCycleByUserGroupReader = vi
        .fn()
        .mockResolvedValue([attestationCycle]);
      const mockCreateAttestationRecordWriter = vi.fn();
      const mockUpdateAttestationRecordStatusWriter = vi.fn();

      const handler = addUserToAudienceCommandHandler({
        globalAttestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        createAttestationRecordWriter: mockCreateAttestationRecordWriter,
        updateAttestationRecordStatusWriter:
          mockUpdateAttestationRecordStatusWriter,
      });

      const command: AddUserToAudienceCommand = {
        userId,
        userGroupId: userGroup.id,
      };

      await handler.execute(command);

      expect(mockAttestationCycleByUserGroupReader).toHaveBeenCalledWith([
        userGroup.id,
      ]);

      expect(mockCreateAttestationRecordWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          cycleId: attestationCycle.id,
          status: 'pending',
          active: true,
        })
      );

      expect(mockUpdateAttestationRecordStatusWriter).not.toHaveBeenCalled();
    });

    it('should activate existing not_required attestation records when appropriate', async () => {
      const userId = userIdSchema.parse('00000000-0000-0000-0000-000000000001');

      const userGroup: UserGroup = {
        id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
        name: 'Group 1',
        users: [userId],
      };

      const notRequiredRecord = buildAttestationRecord(
        withUserId(userId),
        withNotRequiredState()
      );

      const attestationCycle = buildAttestationCycle(
        withUserGroupsAudience([userGroup]),
        withRecords([notRequiredRecord])
      );

      const mockAttestationCycleByUserGroupReader = vi
        .fn()
        .mockResolvedValue([attestationCycle]);
      const mockCreateAttestationRecordWriter = vi.fn();
      const mockUpdateAttestationRecordStatusWriter = vi.fn();

      const handler = addUserToAudienceCommandHandler({
        globalAttestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        createAttestationRecordWriter: mockCreateAttestationRecordWriter,
        updateAttestationRecordStatusWriter:
          mockUpdateAttestationRecordStatusWriter,
      });

      const command: AddUserToAudienceCommand = {
        userId,
        userGroupId: userGroup.id,
      };

      await handler.execute(command);

      expect(mockUpdateAttestationRecordStatusWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          id: notRequiredRecord.id,
          userId,
          status: 'pending',
          active: true,
        })
      );
      expect(mockCreateAttestationRecordWriter).not.toHaveBeenCalled();
    });

    it('should reactivate existing attested attestation records when appropriate', async () => {
      const userId = userIdSchema.parse('00000000-0000-0000-0000-000000000001');

      const userGroup: UserGroup = {
        id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
        name: 'Group 1',
        users: [userId],
      };

      const attestedRecord = buildAttestationRecord(
        withUserId(userId),
        withAttestedState(),
        (record) => ({ ...record, active: false })
      );

      const attestationCycle = buildAttestationCycle(
        withUserGroupsAudience([userGroup]),
        withRecords([attestedRecord])
      );

      const mockAttestationCycleByUserGroupReader = vi
        .fn()
        .mockResolvedValue([attestationCycle]);
      const mockCreateAttestationRecordWriter = vi.fn();
      const mockUpdateAttestationRecordStatusWriter = vi.fn();

      const handler = addUserToAudienceCommandHandler({
        globalAttestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        createAttestationRecordWriter: mockCreateAttestationRecordWriter,
        updateAttestationRecordStatusWriter:
          mockUpdateAttestationRecordStatusWriter,
      });

      const command: AddUserToAudienceCommand = {
        userId,
        userGroupId: userGroup.id,
      };

      await handler.execute(command);

      expect(mockUpdateAttestationRecordStatusWriter).toHaveBeenCalledWith(
        expect.objectContaining({
          id: attestedRecord.id,
          userId,
          status: 'attested',
          active: true,
        })
      );
      expect(mockCreateAttestationRecordWriter).not.toHaveBeenCalled();
    });

    describe('unexpected scenarios', () => {
      it('should throw an error when the attestation record is pending and not activated', async () => {
        const userId = userIdSchema.parse(
          '00000000-0000-0000-0000-000000000001'
        );

        const userGroup: UserGroup = {
          id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
          name: 'Group 1',
          users: [userId],
        };

        // Create a pending record that's already active (shouldn't need activation)
        const pendingRecord = buildAttestationRecord(
          withUserId(userId),
          (record) => ({ ...record, status: 'pending' as const, active: true })
        );

        const attestationCycle = buildAttestationCycle(
          withUserGroupsAudience([userGroup]),
          withRecords([pendingRecord])
        );

        const mockAttestationCycleByUserGroupReader = vi
          .fn()
          .mockResolvedValue([attestationCycle]);
        const mockCreateAttestationRecordWriter = vi.fn();
        const mockUpdateAttestationRecordStatusWriter = vi.fn();

        const handler = addUserToAudienceCommandHandler({
          globalAttestationCycleReader: vi.fn(),
          attestationCycleByUserGroupReader:
            mockAttestationCycleByUserGroupReader,
          createAttestationRecordWriter: mockCreateAttestationRecordWriter,
          updateAttestationRecordStatusWriter:
            mockUpdateAttestationRecordStatusWriter,
        });

        const command: AddUserToAudienceCommand = {
          userId,
          userGroupId: userGroup.id,
        };

        await expect(handler.execute(command)).rejects.toThrow(
          'Unexpected attestation record status'
        );

        expect(mockUpdateAttestationRecordStatusWriter).not.toHaveBeenCalled();
        expect(mockCreateAttestationRecordWriter).not.toHaveBeenCalled();
      });

      it('should throw an error if updating an attestation record fails', async () => {
        const userId = userIdSchema.parse(
          '00000000-0000-0000-0000-000000000001'
        );

        const userGroup: UserGroup = {
          id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
          name: 'Group 1',
          users: [userId],
        };

        // Create a record with an unexpected status (e.g., 'expired')
        const expiredRecord = buildAttestationRecord(
          withUserId(userId),
          (record) => ({ ...record, status: 'expired' as const })
        );

        const attestationCycle = buildAttestationCycle(
          withUserGroupsAudience([userGroup]),
          withRecords([expiredRecord])
        );

        const mockAttestationCycleByUserGroupReader = vi
          .fn()
          .mockResolvedValue([attestationCycle]);
        const mockCreateAttestationRecordWriter = vi.fn();
        const mockUpdateAttestationRecordStatusWriter = vi.fn();

        const handler = addUserToAudienceCommandHandler({
          globalAttestationCycleReader: vi.fn(),
          attestationCycleByUserGroupReader:
            mockAttestationCycleByUserGroupReader,
          createAttestationRecordWriter: mockCreateAttestationRecordWriter,
          updateAttestationRecordStatusWriter:
            mockUpdateAttestationRecordStatusWriter,
        });

        const command: AddUserToAudienceCommand = {
          userId,
          userGroupId: userGroup.id,
        };

        await expect(handler.execute(command)).rejects.toThrow(
          'Unexpected attestation record status'
        );

        expect(mockUpdateAttestationRecordStatusWriter).not.toHaveBeenCalled();
        expect(mockCreateAttestationRecordWriter).not.toHaveBeenCalled();
      });
    });
  });
});
