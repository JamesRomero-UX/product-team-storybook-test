import type {
  IClient,
  ObligationListQueryResponse,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type ObligationsService = ReturnType<typeof obligationsService>;

export function obligationsService(client: IClient) {
  const getObligations: ListQueryFetchFn<
    ObligationListQueryResponse['obligation']
  > = async (query, ctx) => {
    const response = await client.queryObligationList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.obligation, metadata: response.pageMetadata };
  };
  const getObligationById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getObligationById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { obligation, form_configuration } = response;

    return { data: obligation, form_configuration };
  };

  return { getObligations, getObligationById };
}
