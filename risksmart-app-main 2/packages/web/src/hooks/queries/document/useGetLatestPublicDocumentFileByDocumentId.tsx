import type { DocumentFileEntityRow } from '@risksmart-app/trpc/src/types';
import type { GetLatestPublicDocumentFileByDocumentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestPublicDocumentFileByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestPublicDocumentFileByDocumentIdArgs = {
  documentId: string;
};

export const useGetLatestPublicDocumentFileByDocumentId = createQueryHook<
  UseGetLatestPublicDocumentFileByDocumentIdArgs,
  DocumentFileEntityRow | undefined,
  GetLatestPublicDocumentFileByDocumentIdQuery
>({
  trpcQueryOptions: (trpc, { documentId }) =>
    trpc.frontend.documentFile.latestPublicDocumentFileByDocumentId.queryOptions(
      {
        documentId,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({
    document_file: data ? [{ ...data }] : [],
  }),
  graphqlDocument: GetLatestPublicDocumentFileByDocumentIdDocument,
  graphqlVariables: ({ documentId }) => ({ documentId }),
});
