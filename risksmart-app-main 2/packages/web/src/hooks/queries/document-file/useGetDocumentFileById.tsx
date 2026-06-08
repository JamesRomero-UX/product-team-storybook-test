import type { DocumentFileByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDocumentFileByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentFileByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDocumentFileByIdArgs = {
  id: string;
};

export const useGetDocumentFileById = createQueryHook<
  UseGetDocumentFileByIdArgs,
  DocumentFileByIdResponseRow[],
  GetDocumentFileByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.documentFile.documentFileById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ document_file: data }),
  graphqlDocument: GetDocumentFileByIdDocument,
  graphqlVariables: ({ id }) => ({ id }),
});
