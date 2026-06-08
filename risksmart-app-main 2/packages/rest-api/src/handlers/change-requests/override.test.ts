import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApprovalStatusEnum } from 'generated/graphql';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { assert, vi } from 'vitest';

import { handler } from './override';

vi.mock('src/services/node/nodeService');
vi.mock('src/services/change-request/change-request.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/sentryInit');
vi.mock('src/backendGraphqlClient');

const changeRequestServiceMock = vi.mocked(ChangeRequestService);
const hasPermissionMock = vi.mocked(hasPermission);
const findByIdMock = vi.fn();
const updateStatusMock = vi.fn();
const mergeMock = vi.fn();

describe('changeRequests/override', () => {
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

  it('denies request when user does not have permission', async () => {
    hasPermissionMock.mockResolvedValue(false);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          session_variables: {
            'x-hasura-tenant-name': 'tenant',
            'x-hasura-org-id': 'org',
            'x-hasura-user-id': 'userId',
          },
          input: {
            Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            Rationale: 'rationale',
            Approved: true,
          },
        }),
      }),
      stub<Context>({})
    );
    assert.ownInclude(result, {
      statusCode: 403,
      body: JSON.stringify({ message: 'Access denied', extensions: [] }),
    });
  });

  it.each`
    idx  | id                                        | rationale      | approved
    ${1} | ${null}                                   | ${'rationale'} | ${true}
    ${2} | ${''}                                     | ${'rationale'} | ${true}
    ${3} | ${'not-a-uuid'}                           | ${'rationale'} | ${true}
    ${4} | ${'d43b2ede-6d6a-4fac-907d-257f4b7b0'}    | ${'rationale'} | ${true}
    ${5} | ${'d43b2ede-6d6a-4fac-907d-257f4b7b06fc'} | ${''}          | ${true}
    ${6} | ${'d43b2ede-6d6a-4fac-907d-257f4b7b06fc'} | ${null}        | ${true}
    ${7} | ${'d43b2ede-6d6a-4fac-907d-257f4b7b06fc'} | ${'rationale'} | ${null}
  `(
    'return bad request when payload is invalid (idx = $idx)',
    async ({ id, rationale, approved }) => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify({
            session_variables: {
              'x-hasura-tenant-name': 'tenant',
              'x-hasura-org-id': 'org',
              'x-hasura-user-id': 'userId',
            },
            input: {
              Id: id,
              Rationale: rationale,
              Approved: approved,
            },
          }),
        }),
        stub<Context>({})
      );

      assert.ownInclude(result, {
        statusCode: 400,
      });
    }
  );

  it.each([
    ApprovalStatusEnum.Approved,
    ApprovalStatusEnum.Deleted,
    ApprovalStatusEnum.Failed,
    ApprovalStatusEnum.Rejected,
  ])(
    'returns bad request when change request is not pending (%s)',
    async (status) => {
      hasPermissionMock.mockResolvedValue(true);
      findByIdMock.mockResolvedValue({
        ChangeRequestStatus: status,
      });

      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify({
            session_variables: {
              'x-hasura-tenant-name': 'tenant',
              'x-hasura-org-id': 'org',
              'x-hasura-user-id': 'userId',
            },
            input: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
              Rationale: 'rationale',
              Approved: true,
            },
          }),
        }),
        stub<Context>({})
      );

      assert.ownInclude(result, {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Only pending change requests can be overridden',
          extensions: [],
        }),
      });
    }
  );

  it.each`
    approved | expected
    ${true}  | ${ApprovalStatusEnum.Approved}
    ${false} | ${ApprovalStatusEnum.Rejected}
  `(
    'updated change request status and merges it (result = $expected)',
    async ({ approved, expected }) => {
      hasPermissionMock.mockResolvedValue(true);
      findByIdMock.mockResolvedValue({
        ChangeRequestStatus: ApprovalStatusEnum.Pending,
      });

      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          body: JSON.stringify({
            session_variables: {
              'x-hasura-tenant-name': 'tenant',
              'x-hasura-org-id': 'org',
              'x-hasura-user-id': 'userId',
            },
            input: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
              Rationale: 'rationale',
              Approved: approved,
            },
          }),
        }),
        stub<Context>({})
      );

      expect(updateStatusMock).toHaveBeenCalledWith(
        {
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
        },
        expected,
        'rationale',
        'userId'
      );
      if (approved) {
        expect(mergeMock).toHaveBeenCalledWith({
          ChangeRequestStatus: ApprovalStatusEnum.Pending,
        });
      }
      assert.ownInclude(result, {
        statusCode: 200,
      });
    }
  );
});
