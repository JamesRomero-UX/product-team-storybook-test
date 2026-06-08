import type {
  IClient,
  TagTypeListQueryResponse,
} from '../../clients/client.interface';
import type { ListDateTimeQueryFetchFn, ServiceCallContext } from '../../types/service';

export type TagsService = ReturnType<typeof tagsService>;

export const tagsService = (client: IClient) => {
  const getTags: ListDateTimeQueryFetchFn<
    TagTypeListQueryResponse['tagType']
  > = async (query, ctx) => {
    const response = await client.queryTagTypeList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        ...(query.filters?.ids?.length
          ? { filter: { Id: query.filters.ids } }
          : {}),
      }
    );

    return { data: response.tagType, metadata: response.pageMetadata };
  };

  const getTagById = async (id: string, ctx: ServiceCallContext) => {
    const response = await client.getTagTypeById(
      { authorization: ctx.authToken },
      id
    );

    if (response === null) {
      return null;
    }

    const { tagType } = response;

    return { data: tagType };
  };

  return { getTags, getTagById };
};
