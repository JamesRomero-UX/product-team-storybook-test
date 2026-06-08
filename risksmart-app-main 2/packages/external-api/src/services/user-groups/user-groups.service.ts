import type {
  IClient,
  UserGroupListQueryResponse,
} from '../../clients/client.interface';
import type {
  ListDateTimeQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';

export type UserGroupsService = ReturnType<typeof userGroupsService>;

export const userGroupsService = (client: IClient) => {
  const getUserGroups: ListDateTimeQueryFetchFn<
    UserGroupListQueryResponse['userGroup']
  > = async (query, ctx) => {
    const response = await client.queryUserGroupList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
      }
    );

    return { data: response.userGroup, metadata: response.pageMetadata };
  };

  const getUserGroupById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getUserGroupById(
      { authorization: ctx.authToken },
      id
    );

    if (response === null) {
      return null;
    }

    const { userGroup, form_configuration } = response;

    return { data: userGroup, form_configuration };
  };

  return { getUserGroups, getUserGroupById };
};
