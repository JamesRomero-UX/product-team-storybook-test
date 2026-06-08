import type { TagTypeResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetTagsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTagsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetTags = createQueryHook<
  Record<string, never>,
  TagTypeResponseRow[],
  GetTagsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.tag.allTypes.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ tag_type: data }),
  graphqlDocument: GetTagsDocument,
});
