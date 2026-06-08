import type { Context, EventBridgeEvent } from 'aws-lambda';
import { tenantNameSessionKey } from 'src/requestHelpers';
import { vi } from 'vitest';

import { VersionStatusEnum } from '../../../../generated/graphql';
import { AttestationConfigService } from '../../../services/attestation/attestation-config.service';
import { AttestationRecordService } from '../../../services/attestation/attestation-record.service';
import { getOrgModuleContext } from '../../../services/orgUtilities';
import { stub } from '../../../testing/stub';
import type { CheckAttestationsEvent } from './checkAttestations';
import { handler } from './checkAttestations';
import { refreshAttestationRecords } from './refreshAttestations';

vi.mock('../../../services/orgUtilities');
vi.mock('../../../services/attestation/attestation-config.service');
vi.mock('../../../services/attestation/attestation-record.service');
vi.mock('./refreshAttestations');

type Event = EventBridgeEvent<string, CheckAttestationsEvent>;

const context = {} as Context;
describe('checkAttestations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should throw an error if orgKey is missing', async () => {
    const event = stub<Event>({
      detail: {
        event: {
          op: 'INSERT',
          data: { new: { Id: '123' } },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });
    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });

    await expect(handler(event, context, () => null)).rejects.toThrow(
      'No org key found'
    );
  });

  it('should throw an error if tenant is missing', async () => {
    const event = stub<Event>({
      detail: {
        event: {
          op: 'INSERT',
          data: { new: { Id: '123', OrgKey: 'orgKey1' } },
          session_variables: {},
        },
      },
    });
    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });

    await expect(handler(event, context, () => null)).rejects.toThrow(
      'No tenant found'
    );
  });

  it.each([
    { status: VersionStatusEnum.Draft },
    { status: VersionStatusEnum.PendingApproval },
    { status: VersionStatusEnum.Archived },
  ])(
    'should not proceed if the inserted version status is $status',
    async ({ status }) => {
      const event = stub<Event>({
        detail: {
          event: {
            op: 'INSERT',
            data: {
              new: {
                Id: '123',
                OrgKey: 'orgKey1',
                Status: status,
              },
            },
            session_variables: { [tenantNameSessionKey]: 'tenant1' },
          },
        },
      });

      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['attestations'],
        modules: {},
      });
      const refreshAttestationRecordsMock = vi.mocked(
        refreshAttestationRecords
      );

      await handler(event, context, () => null);

      expect(refreshAttestationRecordsMock).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      oldStatus: VersionStatusEnum.Published,
      newStatus: VersionStatusEnum.Published,
    },
  ])(
    'should not proceed if the updated status transitions from $oldStatus to $newStatus',
    async ({ oldStatus, newStatus }) => {
      const event = stub<Event>({
        detail: {
          event: {
            op: 'UPDATE',
            data: {
              new: {
                Id: '123',
                OrgKey: 'orgKey1',
                Status: newStatus,
              },
              old: {
                Id: '123',
                OrgKey: 'orgKey1',
                Status: oldStatus,
              },
            },
            session_variables: { [tenantNameSessionKey]: 'tenant1' },
          },
        },
      });

      vi.mocked(getOrgModuleContext).mockResolvedValue({
        features: ['attestations'],
        modules: {},
      });
      const refreshAttestationRecordsMock = vi.mocked(
        refreshAttestationRecords
      );

      await handler(event, context, () => null);

      expect(refreshAttestationRecordsMock).not.toHaveBeenCalled();
    }
  );

  it("Should refresh the attestation records for the document's parent", async () => {
    const event = stub<Event>({
      detail: {
        event: {
          op: 'INSERT',
          data: {
            new: {
              Id: '123',
              OrgKey: 'orgKey1',
              Status: VersionStatusEnum.Published,
              ParentDocumentId: 'parentDocumentId',
            },
          },
          session_variables: { [tenantNameSessionKey]: 'tenant1' },
        },
      },
    });

    vi.mocked(getOrgModuleContext).mockResolvedValue({
      features: ['attestations'],
      modules: {},
    });
    const configService = vi.mocked(AttestationConfigService);
    const recordService = vi.mocked(AttestationRecordService);
    const refreshAttestationRecordsMock = vi.mocked(refreshAttestationRecords);
    const archiveCurrentAttestationsMock = vi.fn();

    recordService.mockReturnValue(
      stub<ReturnType<typeof AttestationRecordService>>({
        archiveCurrentAttestations: archiveCurrentAttestationsMock,
      })
    );

    configService.mockReturnValue(
      stub<ReturnType<typeof AttestationConfigService>>({
        findWhere: vi
          .fn()
          .mockResolvedValue([{ ParentId: 'parentDocumentId' }]),
      })
    );

    await handler(event, context, () => null);

    expect(refreshAttestationRecordsMock).toHaveBeenCalledWith({
      tenant: 'tenant1',
      orgKey: 'orgKey1',
      config: { ParentId: 'parentDocumentId' },
      refreshExpiry: false,
    });

    expect(archiveCurrentAttestationsMock).toHaveBeenCalledWith(
      'parentDocumentId',
      { useNotAttestedStatus: false }
    );
  });
});
