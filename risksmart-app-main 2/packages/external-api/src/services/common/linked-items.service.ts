import type {
  IClient,
  LinkedItemsListResponse,
} from '../../clients/client.interface';
import type { LinkedListIdDateTimeQueryFetchFn } from '../../types/service';

export type LinkedItemsService = ReturnType<typeof linkedItemsService>;

export function linkedItemsService(client: IClient) {
  const getLinkedItems: LinkedListIdDateTimeQueryFetchFn<
    LinkedItemsListResponse['linkedItem']
  > = async (linkId, query, ctx) => {
    const response = await client.queryLinkedItemsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        linkId,
      }
    );

    return {
      data: response.linkedItem,
      metadata: response.pageMetadata,
    };
  };

  return {
    getLinkedItems,
  };
}
