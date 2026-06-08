import { ApprovalStatusEnum } from 'generated/graphql';
import { CUSTOMER_SUPPORT_ROLE } from 'src/repositories/types';
import { vi } from 'vitest';

import { ChangeRequestService } from './change-request.service';

vi.mock('src/backendGraphqlClient');
const updateMock = vi.fn();

describe('change request service', () => {
  const changeRequestService = ChangeRequestService({
    tenant: 'tenant',
    userId: 'userId',
    orgKey: 'orgId',
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  beforeEach(() => {
    vi.resetAllMocks();

    // Using vi.mocked() with mockReturnValue doesn't work here for some reason.
    vi.mock(
      '../../repositories/change-request/change-request.repository',
      () => ({
        ChangeRequestRepository: () => ({
          update: updateMock,
        }),
      })
    );
  });

  describe('updateStatus', async () => {
    it('should not update when status is unchanged', async () => {
      await changeRequestService.updateStatus(
        {
          Id: 'd43b2ede-6d6a-4fac-907d-257f4b7b06fc',
          OrgKey: 'orgId',
          CreatedAtTimestamp: '2021-09-01T00:00:00Z',
          CreatedByUser: 'userId',
          RequestedChanges: {},
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
          Comment: '',
          responses: [],
          ParentId: '',
          ActionUserId: 'userId',
        },
        ApprovalStatusEnum.Pending,
        'a comment',
        'userId'
      );

      expect(updateMock).not.toHaveBeenCalled();
    });

    it('should set override details when present', async () => {
      await changeRequestService.updateStatus(
        {
          Id: 'd43b2ede-6d6a-4fac-907d-257f4b7b06fc',
          OrgKey: 'orgId',
          CreatedAtTimestamp: '2021-09-01T00:00:00Z',
          CreatedByUser: 'userId',
          RequestedChanges: {},
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
          Comment: '',
          responses: [],
          ParentId: '',
          ActionUserId: 'userId',
        },
        ApprovalStatusEnum.Approved,
        'a comment',
        'userId'
      );

      expect(updateMock).toHaveBeenCalledWith(
        {
          Id: { _eq: 'd43b2ede-6d6a-4fac-907d-257f4b7b06fc' },
        },
        {
          ChangeRequestStatus: ApprovalStatusEnum.Approved,
          OverriddenByUser: 'userId',
          OverriddenAtTimestamp: expect.any(String),
          Comment: 'a comment',
        }
      );
    });

    it('should not set override details when not present', async () => {
      await changeRequestService.updateStatus(
        {
          Id: 'd43b2ede-6d6a-4fac-907d-257f4b7b06fc',
          OrgKey: 'orgId',
          CreatedAtTimestamp: '2021-09-01T00:00:00Z',
          CreatedByUser: 'userId',
          RequestedChanges: {},
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
          Comment: '',
          responses: [],
          ParentId: '',
          ActionUserId: 'userId',
        },
        ApprovalStatusEnum.Approved
      );

      expect(updateMock).toHaveBeenCalledWith(
        {
          Id: { _eq: 'd43b2ede-6d6a-4fac-907d-257f4b7b06fc' },
        },
        {
          ChangeRequestStatus: ApprovalStatusEnum.Approved,
        }
      );
    });
  });
});
