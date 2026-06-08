import type { GetLinkedItemRisksResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetLinkedItemRisksQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLinkedItemRisksDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLinkedItemRisksArgs = { id: string };

export const useGetLinkedItemRisks = createQueryHook<
  UseGetLinkedItemRisksArgs,
  GetLinkedItemRisksResponseRow[],
  GetLinkedItemRisksQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.linkedItem.linkedItemRisks.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ linked_item: data }),
  graphqlDocument: GetLinkedItemRisksDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
