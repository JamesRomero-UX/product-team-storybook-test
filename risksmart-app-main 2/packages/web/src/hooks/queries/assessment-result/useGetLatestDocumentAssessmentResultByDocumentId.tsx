import type { LatestDocumentAssessmentResultByDocumentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetLatestDocumentAssessmentResultByDocumentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestDocumentAssessmentResultByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestDocumentAssessmentResultByDocumentIdArgs = {
  documentId: string;
};

export const useGetLatestDocumentAssessmentResultByDocumentId = createQueryHook<
  UseGetLatestDocumentAssessmentResultByDocumentIdArgs,
  LatestDocumentAssessmentResultByDocumentIdResponseRow[],
  GetLatestDocumentAssessmentResultByDocumentIdQuery
>({
  trpcQueryOptions: (trpc, { documentId }) =>
    trpc.frontend.assessment.latestDocumentAssessmentResultByDocumentId.queryOptions(
      {
        documentId,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({ document_assessment_result: data }),
  graphqlDocument: GetLatestDocumentAssessmentResultByDocumentIdDocument,
  graphqlVariables: ({ documentId }) => ({ DocumentId: documentId }),
});
