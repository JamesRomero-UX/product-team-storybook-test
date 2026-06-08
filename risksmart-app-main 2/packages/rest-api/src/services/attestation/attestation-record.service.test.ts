import { vi } from 'vitest';

import { AttestationRecordStatusEnum } from '../../../generated/graphql';
import { CUSTOMER_SUPPORT_ROLE } from '../../repositories/types';
import { AttestationRecordService } from './attestation-record.service';

vi.mock('src/backendGraphqlClient');

const updateMock = vi.fn();
const createMock = vi.fn();
const findWhereMock = vi.fn();

describe('AttestationRecordService', () => {
  const attestationRecordService = AttestationRecordService({
    tenant: 'tenant',
    userId: 'userId',
    orgKey: 'orgId',
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  beforeEach(() => {
    vi.resetAllMocks();

    // Using vi.mocked() with mockReturnValue doesn't work here for some reason.
    vi.mock(
      '../../repositories/attestation/attestation-record.repository',
      () => ({
        AttestationRecordRepository: () => ({
          update: updateMock,
          create: createMock,
          findWhere: findWhereMock,
        }),
      })
    );
  });

  describe('archiveCurrentAttestations', () => {
    it('should archive current records that are still pending as not required', async () => {
      findWhereMock.mockResolvedValue([]);
      createMock.mockResolvedValue([]);

      await attestationRecordService.archiveCurrentAttestations(
        'attestationConfigId',
        { useNotAttestedStatus: false }
      );

      expect(updateMock).toHaveBeenCalledWith(
        {
          ConfigId: { _eq: 'attestationConfigId' },
          Active: { _eq: true },
          AttestationStatus: { _neq: AttestationRecordStatusEnum.Attested },
          ExpiresAt: { _gt: expect.any(String) },
        },
        {
          Active: false,
          AttestationStatus: AttestationRecordStatusEnum.NotRequired,
        }
      );
    });

    it('should archive current records that are still pending as not attested when feature flag is enabled', async () => {
      findWhereMock.mockResolvedValue([]);
      createMock.mockResolvedValue([]);

      await attestationRecordService.archiveCurrentAttestations(
        'attestationConfigId',
        { useNotAttestedStatus: true }
      );

      expect(updateMock).toHaveBeenCalledWith(
        {
          ConfigId: { _eq: 'attestationConfigId' },
          Active: { _eq: true },
          AttestationStatus: { _neq: AttestationRecordStatusEnum.Attested },
          ExpiresAt: { _gt: expect.any(String) },
        },
        {
          Active: false,
          AttestationStatus: AttestationRecordStatusEnum.NotAttested,
        }
      );
    });
  });

  describe('refreshRequiredUsersForParent', () => {
    it('should update any user IDs not in the list to be not required', async () => {
      findWhereMock.mockResolvedValue([]);
      createMock.mockResolvedValue([]);
      await attestationRecordService.refreshRequiredUsersForNode({
        config: {
          ParentId: 'parentId',
          timeLimitMs: 86400000,
          RequireGlobalAttestation: true,
          AttestationTimeLimit: '1 day',
          groups: [],
        },
        nodeId: 'nodeId',
        userIds: ['user1', 'user2', 'user4'],
      });

      expect(updateMock).toHaveBeenCalledWith(
        {
          NodeId: { _eq: 'nodeId' },
          Active: { _eq: true },
          UserId: { _nin: ['user1', 'user2', 'user4'] },
        },
        {
          AttestationStatus: AttestationRecordStatusEnum.NotRequired,
          Active: false,
        }
      );
    });

    it('should create records for all userIds that are not already in the list', async () => {
      findWhereMock.mockResolvedValue([
        { UserId: 'user1' },
        { UserId: 'user2' },
      ]);
      createMock.mockResolvedValue([]);
      await attestationRecordService.refreshRequiredUsersForNode({
        config: {
          ParentId: 'parentId',
          timeLimitMs: 86400000,
          RequireGlobalAttestation: true,
          AttestationTimeLimit: '1 day',
          groups: [],
        },
        nodeId: 'nodeId',
        userIds: ['user1', 'user2', 'user4'],
      });

      expect(createMock).toHaveBeenCalledWith([
        expect.objectContaining({
          NodeId: 'nodeId',
          UserId: 'user4',
          AttestationStatus: AttestationRecordStatusEnum.Pending,
          Active: true,
        }),
      ]);
    });

    it('should update the expiration date if refreshExpiry is true', async () => {
      findWhereMock.mockResolvedValue([
        { UserId: 'user1' },
        { UserId: 'user2' },
      ]);
      createMock.mockResolvedValue([]);
      await attestationRecordService.refreshRequiredUsersForNode({
        config: {
          ParentId: 'parentId',
          timeLimitMs: 86400000,
          RequireGlobalAttestation: true,
          AttestationTimeLimit: '1 day',
          groups: [],
        },
        nodeId: 'nodeId',
        userIds: ['user1', 'user2', 'user4'],
        refreshExpiry: true,
      });

      expect(updateMock).toHaveBeenCalledWith(
        {
          NodeId: { _eq: 'nodeId' },
          Active: { _eq: true },
        },
        {
          ExpiresAt: expect.any(String),
        }
      );
    });
  });
});
