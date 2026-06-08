import type {
  IClient,
  ImpactListQueryResponse,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type ImpactsService = ReturnType<typeof impactService>;

export function impactService(client: IClient) {
  const getImpacts: ListQueryFetchFn<
    ImpactListQueryResponse['impact']
  > = async (query, ctx) => {
    const response = await client.queryImpactList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.impact, metadata: response.pageMetadata };
  };

  const getImpactById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getImpactById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { impact, form_configuration } = response;

    return { data: impact, form_configuration };
  };

  return { getImpacts, getImpactById };
}
