import type {
  ActionListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type ActionsService = ReturnType<typeof actionsService>;

export function actionsService(client: IClient) {
  const getActions: ListQueryFetchFn<
    ActionListQueryResponse['action']
  > = async (query, ctx) => {
    const actionResponse = await client.queryActionList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return {
      data: actionResponse.action,
      metadata: actionResponse.pageMetadata,
    };
  };
  const getActionById = async (actionId: string, ctx: ServiceCallContext) => {
    const actionResponse = await client.getActionById(
      { authorization: ctx.authToken },
      actionId
    );
    if (actionResponse === null) {
      return null;
    }
    const { action, form_configuration } = actionResponse;

    return { data: action, form_configuration };
  };

  return { getActions, getActionById };
}
