import {
  buildAttestationCycle,
  withGlobalAudience,
  withRecords,
  withUserGroupsAudience,
} from 'test/attestation-cycle/attestation-cycle-builder';
import {
  buildAttestationRecord,
  withUserId,
} from 'test/attestation-cycle/attestation-record-builder';
import { describe, expect, it, vi } from 'vitest';

import { userIdSchema } from '../user';
import { userGroupIdSchema } from '../user-group';
import type { RemoveUserFromAudienceCommand } from './remove-user-from-audience-handler';
import { removeUserFromAudienceCommandHandler } from './remove-user-from-audience-handler';

describe('remove user from audience command handler', () => {
  const testUserId = userIdSchema.parse('e2c7a8a2-4b1e-4c8d-9f3a-7b2e8c1f9a1d');
  const testUserGroupId = userGroupIdSchema.parse(
    'd3f9b8c2-5a2e-4d9f-8c4b-8c3f9d2e0b2c'
  );

  const mockAttestationCycleByUserGroupReader = vi.fn();
  const mockAttestationRecordStatusWriter = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('when user is no longer required for any cycles', () => {
    it('should mark attestation records as not required', async () => {
      const mockRecord = buildAttestationRecord(withUserId(testUserId));
      const mockCycle = buildAttestationCycle(
        withUserGroupsAudience([
          { id: testUserGroupId, name: 'Test Group', users: [] },
        ]),
        withRecords([mockRecord])
      );

      mockAttestationCycleByUserGroupReader.mockResolvedValue([mockCycle]);
      mockAttestationRecordStatusWriter.mockResolvedValue({
        affectedCount: 1,
      });

      const command: RemoveUserFromAudienceCommand = {
        userId: testUserId,
        userGroupId: testUserGroupId,
      };

      const handler = removeUserFromAudienceCommandHandler({
        attestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
      });

      await handler.execute(command);

      expect(mockAttestationCycleByUserGroupReader).toHaveBeenCalledWith([
        testUserGroupId,
      ]);

      expect(mockAttestationRecordStatusWriter).toHaveBeenCalledTimes(1);
      expect(mockAttestationRecordStatusWriter).toHaveBeenCalledWith([
        expect.objectContaining({
          id: mockRecord.id,
          status: 'not_required',
          active: false,
        }),
      ]);
    });
  });

  describe('when the attestation cycle audience is global', () => {
    it('should not mark attestation records as not required', async () => {
      const mockCycle = buildAttestationCycle(withGlobalAudience());

      mockAttestationCycleByUserGroupReader.mockResolvedValue([mockCycle]);

      const command: RemoveUserFromAudienceCommand = {
        userId: testUserId,
        userGroupId: testUserGroupId,
      };

      const handler = removeUserFromAudienceCommandHandler({
        attestationCycleReader: vi.fn(),

        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
      });

      await handler.execute(command);

      expect(mockAttestationCycleByUserGroupReader).toHaveBeenCalledWith([
        testUserGroupId,
      ]);

      expect(mockAttestationRecordStatusWriter).not.toHaveBeenCalled();
    });
  });

  describe('when user is still required via other user groups', () => {
    it('should not mark attestation records as not required', async () => {
      const testUserGroupId2 = userGroupIdSchema.parse(
        'a4e1c9d3-6b3f-5e0a-9d5c-9d4f0e3f1c3d'
      );

      const mockRecord = buildAttestationRecord(withUserId(testUserId));
      const mockCycle = buildAttestationCycle(
        withUserGroupsAudience([
          { id: testUserGroupId, name: 'Test Group', users: [] },
          { id: testUserGroupId2, name: 'Test Group 2', users: [testUserId] },
        ]),
        withRecords([mockRecord])
      );

      mockAttestationCycleByUserGroupReader.mockResolvedValue([mockCycle]);

      const command: RemoveUserFromAudienceCommand = {
        userId: testUserId,
        userGroupId: testUserGroupId,
      };

      const handler = removeUserFromAudienceCommandHandler({
        attestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
      });

      await handler.execute(command);

      expect(mockAttestationCycleByUserGroupReader).toHaveBeenCalledWith([
        testUserGroupId,
      ]);

      expect(mockAttestationRecordStatusWriter).not.toHaveBeenCalled();
    });

    it('should skip cycles where user is still in the audience', async () => {
      const testUserGroupId2 = userGroupIdSchema.parse(
        'a4e1c9d3-6b3f-5e0a-9d5c-9d4f0e3f1c3d'
      );

      const mockRequiredRecord = buildAttestationRecord(withUserId(testUserId));
      const mockNotRequiredRecord = buildAttestationRecord(
        withUserId(testUserId)
      );

      const mockCycle = buildAttestationCycle(
        withUserGroupsAudience([
          { id: testUserGroupId2, name: 'Test Group 2', users: [testUserId] },
        ]),
        withRecords([mockRequiredRecord])
      );

      const mockCycle2 = buildAttestationCycle(
        withUserGroupsAudience([
          { id: testUserGroupId2, name: 'Test Group 1', users: [] },
        ]),
        withRecords([mockNotRequiredRecord])
      );

      mockAttestationCycleByUserGroupReader.mockResolvedValue([
        mockCycle,
        mockCycle2,
      ]);
      mockAttestationRecordStatusWriter.mockResolvedValue({
        affectedCount: 1,
      });

      const command: RemoveUserFromAudienceCommand = {
        userId: testUserId,
        userGroupId: testUserGroupId,
      };

      const handler = removeUserFromAudienceCommandHandler({
        attestationCycleReader: vi.fn(),
        attestationCycleByUserGroupReader:
          mockAttestationCycleByUserGroupReader,
        attestationRecordStatusWriter: mockAttestationRecordStatusWriter,
      });

      await handler.execute(command);

      expect(mockAttestationCycleByUserGroupReader).toHaveBeenCalledWith([
        testUserGroupId,
      ]);

      expect(mockAttestationRecordStatusWriter).toHaveBeenCalledTimes(1);
      expect(mockAttestationRecordStatusWriter).toHaveBeenCalledWith([
        expect.objectContaining({
          id: mockNotRequiredRecord.id,
          status: 'not_required',
          active: false,
        }),
      ]);
    });
  });
});
