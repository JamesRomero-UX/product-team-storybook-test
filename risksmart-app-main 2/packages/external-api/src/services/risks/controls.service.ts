import type {
  ControlListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type ControlsService = ReturnType<typeof controlsService>;

export function controlsService(client: IClient) {
  const getControls: ListQueryFetchFn<
    ControlListQueryResponse['control']
  > = async (query, ctx) => {
    const rawResponse = await client.queryControlList(
      {
        authorization: ctx.authToken,
      },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: rawResponse.control, metadata: rawResponse.pageMetadata };
  };

  const getControlById = async (controlId: string, ctx: ServiceCallContext) => {
    const controlResponse = await client.getControlById(
      { authorization: ctx.authToken },
      controlId
    );
    if (controlResponse === null) {
      return null;
    }
    const { control, form_configuration } = controlResponse;

    return { data: control, form_configuration };
  };

  return { getControls, getControlById };
}
