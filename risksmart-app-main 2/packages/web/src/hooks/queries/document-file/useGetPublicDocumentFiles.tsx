import type { PublicDocumentFilesResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetPublicDocumentFilesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetPublicDocumentFilesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetPublicDocumentFilesArgs = {
  userId: string;
};

export const useGetPublicDocumentFiles = createQueryHook<
  UseGetPublicDocumentFilesArgs,
  PublicDocumentFilesResponseRow[],
  GetPublicDocumentFilesQuery
>({
  trpcQueryOptions: (trpc, { userId }) =>
    trpc.frontend.documentFile.publicDocumentFiles.queryOptions({ userId }),
  mapTrpcDataToGraphQL: (data) => ({ document_file: data }),
  graphqlDocument: GetPublicDocumentFilesDocument,
  graphqlVariables: ({ userId }) => ({ currentUserId: userId }),
});
