import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { ApproverResponse } from 'generated/graphql';
import { ApprovalStatusEnum } from 'generated/graphql';
import { vi } from 'vitest';

import { ChangeRequestService } from '../../services/change-request/change-request.service';
import { checkStatus } from '../../services/change-request/checkStatus';
import { stub } from '../../testing/stub';
import type { DataChangeEvent } from '../events/DataChangeEvent';
import { handler } from './updateStatus';

vi.mock('src/services/change-request/change-request.service');
vi.mock('src/services/change-request/checkStatus');
vi.mock('src/sentryInit');

const changeRequestServiceMock = vi.mocked(ChangeRequestService);
const findByIdMock = vi.fn();
const checkStatusMock = vi.mocked(checkStatus);

const updateStatusMock = vi.fn();
const mergeMock = vi.fn();

describe('changeRequests/updateStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    changeRequestServiceMock.mockReturnValue({
      findById: findByIdMock,
      findActiveChangeRequest: vi.fn(),
      delete: vi.fn(),
      amendChanges: vi.fn(),
      create: vi.fn(),
      getActiveLevelId: vi.fn(),
      getWorkflow: vi.fn(),
      updateStatus: updateStatusMock,
      merge: mergeMock,
      findContributors: vi.fn(),
    });
  });

  it.each`
    crStatus                       | newStatus                      | expectMerge | expectedStatus
    ${ApprovalStatusEnum.Pending}  | ${ApprovalStatusEnum.Rejected} | ${false}    | ${ApprovalStatusEnum.Rejected}
    ${ApprovalStatusEnum.Pending}  | ${ApprovalStatusEnum.Pending}  | ${false}    | ${ApprovalStatusEnum.Pending}
    ${ApprovalStatusEnum.Pending}  | ${ApprovalStatusEnum.Approved} | ${true}     | ${ApprovalStatusEnum.Approved}
    ${ApprovalStatusEnum.Approved} | ${ApprovalStatusEnum.Approved} | ${false}    | ${ApprovalStatusEnum.Approved}
    ${ApprovalStatusEnum.Rejected} | ${ApprovalStatusEnum.Rejected} | ${false}    | ${ApprovalStatusEnum.Rejected}
  `(
    'updates change request status and merges it if transitioning (merge = $expectMerge, $expectedStatus => $expectedStatus)',
    async ({ crStatus, newStatus, expectMerge, expectedStatus }) => {
      findByIdMock.mockResolvedValue({
        ChangeRequestStatus: crStatus,
      });
      checkStatusMock.mockReturnValue({
        activeLevelId: 'level-1',
        status: newStatus,
      });
      await handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<ApproverResponse, 'approver_response'>
          >
        >({
          detail: {
            table: { name: 'approver_response' },
            event: {
              data: {
                new: {
                  Id: 'approver-response-1',
                  ChangeRequestId: 'change-request-1',
                },
              },
              session_variables: {
                'x-hasura-tenant-name': 'MultiTenant',
                'x-hasura-user-id': 'testUserId1',
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      );
      expect(updateStatusMock).toHaveBeenCalledWith(
        {
          ChangeRequestStatus: crStatus,
        },
        expectedStatus
      );
      if (expectMerge) {
        expect(mergeMock).toHaveBeenCalled();
      } else {
        expect(mergeMock).not.toHaveBeenCalled();
      }
    }
  );
});
