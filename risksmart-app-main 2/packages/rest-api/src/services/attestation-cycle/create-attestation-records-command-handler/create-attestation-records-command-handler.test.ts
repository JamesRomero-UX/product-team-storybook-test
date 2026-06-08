import {
  buildAttestationCycle,
  withAllowCarryForward,
  withGlobalAudience,
  withRecords,
  withUserGroupsAudience,
} from 'test/attestation-cycle/attestation-cycle-builder';
import {
  buildAttestationRecord,
  withAttestedState,
  withUserId,
} from 'test/attestation-cycle/attestation-record-builder';

import { userIdSchema } from '../user';
import { type UserGroup, userGroupIdSchema } from '../user-group';
import type { CreateAttestationRecordsCommand } from './create-attestation-records-command-handler';
import { createAttestationRecordsCommandHandler } from './create-attestation-records-command-handler';

describe('create attestation records command handler', () => {
  vi.mock('dayjs', () => ({
    default: () => ({
      toISOString: () => '2025-01-01T00:00:00.000Z',
    }),
  }));

  describe('when the attestation cycle audience is global', () => {
    const attestationCycle = buildAttestationCycle(withGlobalAudience());

    const command: CreateAttestationRecordsCommand = {
      attestationCycleId: attestationCycle.id,
    };

    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(attestationCycle);

    const mockGlobalUserReader = vi
      .fn()
      .mockResolvedValue([
        userIdSchema.parse('00000000-0000-0000-0000-000000000001'),
        userIdSchema.parse('00000000-0000-0000-0000-000000000002'),
        userIdSchema.parse('00000000-0000-0000-0000-000000000003'),
      ]);

    const mockCreateAttestationRecordsForUsersWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 2 });

    beforeAll(async () => {
      const handler = createAttestationRecordsCommandHandler({
        globalUserReader: mockGlobalUserReader,
        attestationRecordsWriter: mockCreateAttestationRecordsForUsersWriter,
        previousAttestationCycleReader: vi.fn(),
        attestationCycleByIdReader: mockAttestationCycleByIdReader,
      });

      await handler.execute(command);
    });

    it('should get a list of all global users', () => {
      expect(mockGlobalUserReader).toHaveBeenCalledTimes(1);
    });

    it('should create attestation records for all users in the audience', async () => {
      expect(mockCreateAttestationRecordsForUsersWriter).toHaveBeenCalledWith([
        {
          active: true,
          attestedAt: null,
          configId: attestationCycle.config.id,
          cycleId: attestationCycle.id,
          documentFileId: attestationCycle.parentId,
          expiresAt: null,
          status: 'pending',
          userId: '00000000-0000-0000-0000-000000000001',
          carriedForwardFromRecordId: null,
        },
        {
          active: true,
          attestedAt: null,
          configId: attestationCycle.config.id,
          cycleId: attestationCycle.id,
          documentFileId: attestationCycle.parentId,
          expiresAt: null,
          status: 'pending',
          userId: '00000000-0000-0000-0000-000000000002',
          carriedForwardFromRecordId: null,
        },
        {
          active: true,
          attestedAt: null,
          configId: attestationCycle.config.id,
          cycleId: attestationCycle.id,
          documentFileId: attestationCycle.parentId,
          expiresAt: null,
          status: 'pending',
          userId: '00000000-0000-0000-0000-000000000003',
          carriedForwardFromRecordId: null,
        },
      ]);
    });
  });

  describe('when the audience is specific user groups', () => {
    const userGroup1: UserGroup = {
      id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000010'),
      name: 'Group 1',
      users: [userIdSchema.parse('00000000-0000-0000-0000-000000000001')],
    };

    const userGroup2: UserGroup = {
      id: userGroupIdSchema.parse('00000000-0000-0000-0000-000000000020'),
      name: 'Group 2',
      users: [userIdSchema.parse('00000000-0000-0000-0000-000000000002')],
    };

    const attestationCycle = buildAttestationCycle(
      withUserGroupsAudience([userGroup1, userGroup2])
    );

    const command: CreateAttestationRecordsCommand = {
      attestationCycleId: attestationCycle.id,
    };

    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(attestationCycle);

    const mockGlobalUserReader = vi.fn();

    const mockCreateAttestationRecordsForUsersWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 2 });

    beforeAll(async () => {
      const handler = createAttestationRecordsCommandHandler({
        globalUserReader: mockGlobalUserReader,
        attestationRecordsWriter: mockCreateAttestationRecordsForUsersWriter,
        previousAttestationCycleReader: vi.fn(),
        attestationCycleByIdReader: mockAttestationCycleByIdReader,
      });

      await handler.execute(command);
    });

    it('should not get a list of all global users', () => {
      expect(mockGlobalUserReader).not.toHaveBeenCalled();
    });

    it('should create attestation records for all users in the audience', async () => {
      expect(mockCreateAttestationRecordsForUsersWriter).toHaveBeenCalledWith([
        {
          active: true,
          attestedAt: null,
          configId: attestationCycle.config.id,
          cycleId: attestationCycle.id,
          documentFileId: attestationCycle.parentId,
          expiresAt: null,
          status: 'pending',
          userId: '00000000-0000-0000-0000-000000000001',
          carriedForwardFromRecordId: null,
        },
        {
          active: true,
          attestedAt: null,
          configId: attestationCycle.config.id,
          cycleId: attestationCycle.id,
          documentFileId: attestationCycle.parentId,
          expiresAt: null,
          status: 'pending',
          userId: '00000000-0000-0000-0000-000000000002',
          carriedForwardFromRecordId: null,
        },
      ]);
    });
  });

  it('should create carry forward attestations from the most recent cycle when enabled', async () => {
    const attestationCycleWithCarryForward = buildAttestationCycle(
      withAllowCarryForward(),
      withRecords([]),
      withGlobalAudience()
    );

    const command: CreateAttestationRecordsCommand = {
      attestationCycleId: attestationCycleWithCarryForward.id,
    };

    const previousAttestedRecord = buildAttestationRecord(
      withUserId('00000000-0000-0000-0000-000000000001'),
      withAttestedState()
    );
    const previousCycle = buildAttestationCycle(
      withGlobalAudience(),
      withRecords([
        previousAttestedRecord,
        buildAttestationRecord(
          withUserId('00000000-0000-0000-0000-000000000002')
        ),
      ])
    );

    const mockAttestationCycleByIdReader = vi
      .fn()
      .mockResolvedValue(attestationCycleWithCarryForward);

    const mockGlobalUserReader = vi
      .fn()
      .mockResolvedValue([
        userIdSchema.parse('00000000-0000-0000-0000-000000000001'),
        userIdSchema.parse('00000000-0000-0000-0000-000000000002'),
      ]);

    const mockCreateAttestationRecordsForUsersWriter = vi
      .fn()
      .mockResolvedValue({ affectedCount: 2 });

    const mockPreviousAttestationCycleReader = vi
      .fn()
      .mockResolvedValue(previousCycle);

    const handler = createAttestationRecordsCommandHandler({
      globalUserReader: mockGlobalUserReader,
      attestationRecordsWriter: mockCreateAttestationRecordsForUsersWriter,
      previousAttestationCycleReader: mockPreviousAttestationCycleReader,
      attestationCycleByIdReader: mockAttestationCycleByIdReader,
    });

    await handler.execute(command);

    expect(mockCreateAttestationRecordsForUsersWriter).toHaveBeenCalledWith([
      {
        active: true,
        attestedAt: '2024-01-01T00:00:00.000Z',
        configId: attestationCycleWithCarryForward.config.id,
        cycleId: attestationCycleWithCarryForward.id,
        documentFileId: attestationCycleWithCarryForward.parentId,
        expiresAt: null,
        status: 'attested',
        userId: '00000000-0000-0000-0000-000000000001',
        carriedForwardFromRecordId: previousAttestedRecord.id,
      },
      {
        active: true,
        attestedAt: null,
        configId: attestationCycleWithCarryForward.config.id,
        cycleId: attestationCycleWithCarryForward.id,
        documentFileId: attestationCycleWithCarryForward.parentId,
        expiresAt: null,
        status: 'pending',
        userId: '00000000-0000-0000-0000-000000000002',
        carriedForwardFromRecordId: null,
      },
    ]);
  });
});
