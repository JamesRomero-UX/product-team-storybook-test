import type {
  IClient,
  UsersListQueryResponse,
} from '../../clients/client.interface';
import { UserValidationError } from '../../errors/user.errors';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type {
  ListDateTimeQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';
import { chunk } from '../../utils/array';

const USER_ID_BATCH_SIZE = 100;

export type UsersService = ReturnType<typeof usersService>;

export function usersService(client: IClient) {
  const getUserById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getUserById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { user, form_configuration = null } = response;

    return { data: user, form_configuration };
  };

  const getUsers: ListDateTimeQueryFetchFn<
    UsersListQueryResponse['user']
  > = async (query, ctx) => {
    const response = await client.queryUserList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        ...(query.filters?.ids?.length
          ? { filter: { Id: query.filters?.ids } }
          : {}),
      }
    );

    return { data: response.user, metadata: response.pageMetadata };
  };

  const validateUserIds = async (
    userIds: string[],
    ctx: MutateServiceContext
  ) => {
    const uniqueIds = [...new Set(userIds)];

    if (uniqueIds.length === 0) {
      throw new UserValidationError(
        `Provided user ID list empty, at least one required.`
      );
    }

    const batches = chunk(uniqueIds, USER_ID_BATCH_SIZE);

    const batchResults = await Promise.all(
      batches.map((batch) =>
        getUsers(
          {
            filters: { ids: batch },
            limit: batch.length,
            beforeDateTime: null,
            beforeId: null,
            afterDateTime: null,
            afterId: null,
          },
          ctx
        )
      )
    );

    const returnedIds = batchResults.flatMap((r) =>
      r.data.map((user) => user.Id)
    );
    const returnedIdSet = new Set(returnedIds);
    const unmatchedIds = uniqueIds.filter((id) => !returnedIdSet.has(id));

    if (unmatchedIds.length > 0) {
      throw new UserValidationError(
        `Users with IDs ${unmatchedIds.join(', ')} not found`
      );
    }

    return returnedIds;
  };

  return { getUsers, getUserById, validateUserIds };
}
