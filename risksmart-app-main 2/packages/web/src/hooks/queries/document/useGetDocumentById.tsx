import { VersionStatus } from '@risksmart-app/domain/src/types/consts';
import type { DocumentByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDocumentByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDocumentByIdArgs = {
  documentId: string;
};

function mapTrpcDocumentToGraphQL(
  document: DocumentByIdResponseRow
): GetDocumentByIdQuery['document'][number] {
  // Filter document files by status for draft and published versions
  const draftVersions =
    document.documentFiles?.filter(
      (file) => file.Status === VersionStatus.Draft
    ) || [];

  const publishedVersions =
    document.documentFiles?.filter(
      (file) => file.Status === VersionStatus.Published
    ) || [];

  return {
    ...document,
    latestDraftVersion: draftVersions,
    latestPublishedVersion: publishedVersions,
  };
}

export const useGetDocumentById = createQueryHook<
  UseGetDocumentByIdArgs,
  DocumentByIdResponseRow[],
  GetDocumentByIdQuery
>({
  trpcQueryOptions: (trpc, { documentId }) =>
    trpc.frontend.document.documentById.queryOptions({ documentId }),
  mapTrpcDataToGraphQL: (data) => ({
    document: data.map(mapTrpcDocumentToGraphQL),
  }),
  graphqlDocument: GetDocumentByIdDocument,
  graphqlVariables: ({ documentId }) => ({ id: documentId }),
});
