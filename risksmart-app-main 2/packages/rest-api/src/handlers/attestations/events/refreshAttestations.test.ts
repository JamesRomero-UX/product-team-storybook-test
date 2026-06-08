import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { AttestationConfig } from 'generated/graphql';
import { UserStatusEnum } from 'generated/graphql';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from 'src/repositories/types';
import { tenantNameSessionKey } from 'src/requestHelpers';
import { AttestationConfigService } from 'src/services/attestation/attestation-config.service';
import { AttestationRecordService } from 'src/services/attestation/attestation-record.service';
import { DocumentVersionService } from 'src/services/document-version/document-version.service';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import type { AttestationRefreshEvent } from './refreshAttestations';
import { handler } from './refreshAttestations';

vi.mock('src/services/orgUtilities');
vi.mock('src/services/attestation/attestation-config.service');
vi.mock('src/services/attestation/attestation-record.service');
vi.mock('src/services/document-version/document-version.service');

type Event = EventBridgeEvent<string, AttestationRefreshEvent>;

const context = {} as Context;

describe('Attestation Refresh Handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('THIRD_PARTY_CONNECTION_NAME', 'third_party_connection');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('should throw an error if orgKey is missing', async () => {
    const event = stub<Event>({
      detail: {
        table: { name: 'attestation_config' },
        event: {
          data: { old: {} },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });

    await expect(handler(event, context, () => null)).rejects.toThrow(
      'No org key found'
    );
  });

  it('should throw an error if tenant is missing', async () => {
    const event = stub<Event>({
      detail: {
        table: { name: 'attestation_config' },
        event: {
          data: { old: { OrgKey: 'orgKey1' } },
          session_variables: {},
        },
      },
    });

    await expect(handler(event, context, () => null)).rejects.toThrow(
      'No tenant found'
    );
  });

  it('should return if user is a third party respondent', async () => {
    const event = stub<Event>({
      detail: {
        table: { name: 'organisationuser' },
        event: {
          data: { new: { RoleKey: 'ThirdPartyRespondent' } },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });

    await handler(event, context, () => null);

    expect(getOrgModuleContext).not.toHaveBeenCalled();
    expect(AttestationConfigService).not.toHaveBeenCalled();
    expect(AttestationRecordService).not.toHaveBeenCalled();
  });

  it('should return if auth connection of user is third party db', async () => {
    const event = stub<Event>({
      detail: {
        table: { name: 'organisationuser' },
        event: {
          data: { new: { AuthConnection: 'third_party_connection' } },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });

    await handler(event, context, () => null);

    expect(getOrgModuleContext).not.toHaveBeenCalled();
    expect(AttestationConfigService).not.toHaveBeenCalled();
    expect(AttestationRecordService).not.toHaveBeenCalled();
  });

  it('should not proceed if attestations feature is disabled', async () => {
    const event = stub<Event>({
      detail: {
        table: { name: 'attestation_config' },
        event: {
          data: { old: { OrgKey: 'orgKey1' } },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });
    (getOrgModuleContext as Mock).mockResolvedValue({
      features: [],
      modules: {},
    });

    await handler(event, context, () => null);

    expect(getOrgModuleContext).toHaveBeenCalledWith({
      orgKey: 'orgKey1',
      tenant: 'tenant1',
    });
    expect(AttestationConfigService).not.toHaveBeenCalled();
    expect(AttestationRecordService).not.toHaveBeenCalled();
  });

  it('should call config and record services correctly when feature is enabled', async () => {
    const event = stub<Event>({
      detail: {
        event: {
          data: {
            old: { OrgKey: 'orgKey1' },
            new: { OrgKey: 'orgKey1', ParentId: 'parentId1' },
          },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
          op: 'UPDATE',
        },
        table: { name: 'attestation_config' },
      },
    });

    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findLatestPublishedByParentDocumentId: vi
          .fn()
          .mockResolvedValue({ Id: 'nodeId' }),
      })
    );

    const mockConfigServiceInstance = stub<
      ReturnType<typeof AttestationConfigService>
    >({
      findWhere: vi.fn().mockResolvedValue([{ ParentId: 'parentId1' }]),
      getAttestationUsers: vi
        .fn()
        .mockResolvedValue([{ Id: 'user1', Status: UserStatusEnum.Active }]),
    });
    const mockRecordServiceInstance = stub<
      ReturnType<typeof AttestationRecordService>
    >({
      refreshRequiredUsersForNode: vi.fn().mockResolvedValue(null),
    });
    vi.mocked(AttestationConfigService).mockReturnValue(
      mockConfigServiceInstance
    );
    vi.mocked(AttestationRecordService).mockReturnValue(
      mockRecordServiceInstance
    );

    await handler(event, context, () => null);

    expect(AttestationConfigService).toHaveBeenCalledWith({
      orgKey: 'orgKey1',
      tenant: 'tenant1',
      userId: SYSTEM_USER,
      userRole: CUSTOMER_SUPPORT_ROLE,
    });
    expect(AttestationRecordService).toHaveBeenCalledWith({
      orgKey: 'orgKey1',
      tenant: 'tenant1',
      userId: SYSTEM_USER,
      userRole: CUSTOMER_SUPPORT_ROLE,
    });

    expect(mockConfigServiceInstance.findWhere).toHaveBeenCalled();
    expect(mockConfigServiceInstance.getAttestationUsers).toHaveBeenCalledWith({
      ParentId: 'parentId1',
    });
    expect(
      mockRecordServiceInstance.refreshRequiredUsersForNode
    ).toHaveBeenCalledWith({
      config: { ParentId: 'parentId1' },
      nodeId: 'nodeId',
      userIds: ['user1'],
      refreshExpiry: false,
    });
  });

  it('Should call AttestationRecordService.refreshRequiredUsersForParent with refreshExpiry set to true when AttestationTimeLimit changes', async () => {
    const event = stub<Event>({
      detail: {
        event: {
          data: {
            old: {
              OrgKey: 'orgKey1',
              AttestationTimeLimit: '2 mons',
            } as AttestationConfig,
            new: {
              OrgKey: 'orgKey1',
              AttestationTimeLimit: '2 years',
              ParentId: 'parentId1',
            } as AttestationConfig,
          },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
          op: 'UPDATE',
        },
        table: { name: 'attestation_config' },
      },
    });

    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findLatestPublishedByParentDocumentId: vi
          .fn()
          .mockResolvedValue({ Id: 'nodeId' }),
      })
    );

    const mockConfigServiceInstance = stub<
      ReturnType<typeof AttestationConfigService>
    >({
      findWhere: vi.fn().mockResolvedValue([{ ParentId: 'parentId1' }]),
      getAttestationUsers: vi
        .fn()
        .mockResolvedValue([{ Id: 'user1', Status: UserStatusEnum.Active }]),
    });
    const mockRecordServiceInstance = stub<
      ReturnType<typeof AttestationRecordService>
    >({
      refreshRequiredUsersForNode: vi.fn().mockResolvedValue(null),
    });
    vi.mocked(AttestationConfigService).mockReturnValue(
      mockConfigServiceInstance
    );
    vi.mocked(AttestationRecordService).mockReturnValue(
      mockRecordServiceInstance
    );

    await handler(event, context, () => null);

    expect(
      mockRecordServiceInstance.refreshRequiredUsersForNode
    ).toHaveBeenCalledWith({
      config: { ParentId: 'parentId1' },
      nodeId: 'nodeId',
      userIds: ['user1'],
      refreshExpiry: true,
    });
  });

  it("Should use the document's first file ID as the parent ID if the node is a document", async () => {
    const event = stub<Event>({
      detail: {
        event: {
          data: {
            old: {
              OrgKey: 'orgKey1',
              AttestationTimeLimit: '2 mons',
            } as AttestationConfig,
            new: {
              OrgKey: 'orgKey1',
              AttestationTimeLimit: '2 years',
              ParentId: 'parentId1',
            } as AttestationConfig,
          },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
          op: 'UPDATE',
        },
        table: { name: 'attestation_config' },
      },
    });

    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findLatestPublishedByParentDocumentId: vi
          .fn()
          .mockResolvedValue({ Id: 'fileId' }),
      })
    );

    const mockConfigServiceInstance = stub<
      ReturnType<typeof AttestationConfigService>
    >({
      findWhere: vi.fn().mockResolvedValue([{ ParentId: 'parentId1' }]),
      getAttestationUsers: vi
        .fn()
        .mockResolvedValue([{ Id: 'user1', Status: UserStatusEnum.Active }]),
    });
    const mockRecordServiceInstance = stub<
      ReturnType<typeof AttestationRecordService>
    >({
      refreshRequiredUsersForNode: vi.fn().mockResolvedValue(null),
    });
    vi.mocked(AttestationConfigService).mockReturnValue(
      mockConfigServiceInstance
    );
    vi.mocked(AttestationRecordService).mockReturnValue(
      mockRecordServiceInstance
    );

    await handler(event, context, () => null);

    expect(DocumentVersionService).toHaveBeenCalledWith({
      orgKey: 'orgKey1',
      tenant: 'tenant1',
      userId: SYSTEM_USER,
      userRole: CUSTOMER_SUPPORT_ROLE,
    });
    expect(
      mockRecordServiceInstance.refreshRequiredUsersForNode
    ).toHaveBeenCalledWith({
      config: { ParentId: 'parentId1' },
      nodeId: 'fileId',
      userIds: ['user1'],
      refreshExpiry: true,
    });
  });

  it('should ignored archived users', async () => {
    const event = stub<Event>({
      detail: {
        event: {
          data: {
            old: { OrgKey: 'orgKey1' },
            new: { OrgKey: 'orgKey1', ParentId: 'parentId1' },
          },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
          op: 'UPDATE',
        },
        table: { name: 'attestation_config' },
      },
    });

    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });
    vi.mocked(DocumentVersionService).mockReturnValue(
      stub<ReturnType<typeof DocumentVersionService>>({
        findLatestPublishedByParentDocumentId: vi
          .fn()
          .mockResolvedValue({ Id: 'nodeId' }),
      })
    );

    const mockConfigServiceInstance = stub<
      ReturnType<typeof AttestationConfigService>
    >({
      findWhere: vi.fn().mockResolvedValue([{ ParentId: 'parentId1' }]),
      getAttestationUsers: vi.fn().mockResolvedValue([
        { Id: 'user1', Status: UserStatusEnum.Active },
        {
          Id: 'user2',
          Status: UserStatusEnum.Archived,
        },
      ]),
    });
    const mockRecordServiceInstance = stub<
      ReturnType<typeof AttestationRecordService>
    >({
      refreshRequiredUsersForNode: vi.fn().mockResolvedValue(null),
    });
    vi.mocked(AttestationConfigService).mockReturnValue(
      mockConfigServiceInstance
    );
    vi.mocked(AttestationRecordService).mockReturnValue(
      mockRecordServiceInstance
    );

    await handler(event, context, () => null);

    expect(
      mockRecordServiceInstance.refreshRequiredUsersForNode
    ).toHaveBeenCalledWith({
      config: { ParentId: 'parentId1' },
      nodeId: 'nodeId',
      userIds: ['user1'],
      refreshExpiry: false,
    });
  });
});
