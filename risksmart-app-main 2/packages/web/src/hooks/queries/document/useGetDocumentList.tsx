import type { DocumentListSimpleResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDocumentListQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDocumentListArgs = Record<string, never>;

export const useGetDocumentList = createQueryHook<
  UseGetDocumentListArgs,
  DocumentListSimpleResponseRow[],
  GetDocumentListQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.document.list.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ document: data }),
  graphqlDocument: GetDocumentListDocument,
});
