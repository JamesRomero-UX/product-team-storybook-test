import type { GetLinkedItemsResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetLinkedItemsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLinkedItemsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLinkedItemsArgs = {
  id: string;
  includeInternalAudit: boolean;
  includeCompliance: boolean;
};

export const useGetLinkedItems = createQueryHook<
  UseGetLinkedItemsArgs,
  GetLinkedItemsResponseRow[],
  GetLinkedItemsQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.linkedItem.linkedItems.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ linked_item: data ?? [] }),
  graphqlDocument: GetLinkedItemsDocument,
  graphqlVariables: ({ id, includeInternalAudit, includeCompliance }) => ({
    Id: id,
    IncludeInternalAudit: includeInternalAudit,
    IncludeCompliance: includeCompliance,
  }),
});
