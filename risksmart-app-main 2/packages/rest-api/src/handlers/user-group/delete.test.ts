import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getHasuraBackendClientForAction } from '../../backendGraphqlClient';
import { deleteUserGroup } from '../../services/user-group/userGroupService';
import { stub } from '../../testing/stub';
import { handler } from './delete';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/user-group/userGroupService');
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const deleteUserGroupMock = vi.mocked(deleteUserGroup);

describe('userGroup/delete', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
  });
  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });
  it('should invoke delete for the given user group IDs', async () => {
    deleteUserGroupMock.mockResolvedValue(1);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            Ids: ['14897e55-02f6-483f-ada5-8986cc7e2ffa'],
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      JSON.stringify({
        affected_rows: 1,
      })
    );
    expect(deleteUserGroupMock).toHaveBeenCalledWith(hasuraMock, {
      UserGroupIds: ['14897e55-02f6-483f-ada5-8986cc7e2ffa'],
    });
  });
});
