import type { DocumentRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetDocumentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import { createQueryHook } from 'src/utils';

/**
 * Maps TRPC document data to match the GraphQL query structure
 */
export function mapTrpcDocumentsToGraphQL(
  trpcData: DocumentRegisterResponse
): GetDocumentsQuery {
  const documentWithLatestPublishedVersion = trpcData.document.map(
    (document) => {
      const previouslyPublishedVersions = document?.documentFiles.filter(
        (documentFile) => !!documentFile.PublishedDate
      );

      const latestPublishedVersion = _.orderBy(
        previouslyPublishedVersions,
        ['PublishedDate'],
        ['desc']
      )[0];

      const latestDocumentFile = _.orderBy(
        document?.documentFiles,
        ['CreatedAtTimestamp'],
        ['desc']
      )[0];

      return {
        ...document,
        documentFiles: [latestDocumentFile],
        latestPublishedVersion: [
          {
            PublishedDate: latestPublishedVersion?.PublishedDate,
          },
        ],
      };
    }
  );

  return {
    document: documentWithLatestPublishedVersion,
    assessment_result_parent: trpcData.assessment_result_parent,
  };
}

type UseGetPolicyRegisterArgs = Record<string, never>;

export const useGetPolicyRegister = createQueryHook<
  UseGetPolicyRegisterArgs,
  DocumentRegisterResponse,
  GetDocumentsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.document.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcDocumentsToGraphQL,
  graphqlDocument: GetDocumentsDocument,
  graphqlVariables: () => ({
    includeAssessmentResultsHistory: true,
  }),
});
