import type {
  IClient,
  ThirdPartyListQueryResponse,
} from '../../clients/client.interface';
import type { ListQueryFetchFn, ServiceCallContext } from '../../types/service';

export type ThirdPartyService = ReturnType<typeof thirdPartyService>;

export function thirdPartyService(client: IClient) {
  const getThirdParties: ListQueryFetchFn<
    ThirdPartyListQueryResponse['thirdParty']
  > = async (query, ctx) => {
    const response = await client.queryThirdPartyList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.thirdParty, metadata: response.pageMetadata };
  };
  const getThirdPartyById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getThirdPartyById(
      { authorization: ctx.authToken },
      id
    );
    if (response === null) {
      return null;
    }
    const { thirdParty, form_configuration } = response;

    return { data: thirdParty, form_configuration };
  };

  return { getThirdParties, getThirdPartyById };
}
