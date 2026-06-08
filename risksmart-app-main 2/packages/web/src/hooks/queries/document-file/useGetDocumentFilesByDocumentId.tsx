import type { DocumentFilesByDocumentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDocumentFilesByDocumentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentFilesByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDocumentFilesByDocumentIdArgs = {
  documentId: string;
};

export const useGetDocumentFilesByDocumentId = createQueryHook<
  UseGetDocumentFilesByDocumentIdArgs,
  DocumentFilesByDocumentIdResponseRow[],
  GetDocumentFilesByDocumentIdQuery
>({
  trpcQueryOptions: (trpc, { documentId }) =>
    trpc.frontend.documentFile.documentFilesByDocumentId.queryOptions({
      documentId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ document_file: data }),
  graphqlDocument: GetDocumentFilesByDocumentIdDocument,
  graphqlVariables: ({ documentId }) => ({ documentId }),
});
