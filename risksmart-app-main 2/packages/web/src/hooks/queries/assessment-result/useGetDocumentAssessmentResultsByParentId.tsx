import type { DocumentAssessmentResultsByParentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDocumentAssessmentResultsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentAssessmentResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetDocumentAssessmentResultsByParentIdArgs = {
  parentId: string;
};

/**
 * Maps TRPC document assessment result data to match the GraphQL query structure
 */
export function mapTrpcDocumentAssessmentResultsToGraphQL(
  trpcData: DocumentAssessmentResultsByParentIdResponseRow[]
): GetDocumentAssessmentResultsByParentIdQuery {
  return {
    document_assessment_result: trpcData,
  };
}

export const useGetDocumentAssessmentResultsByParentId = createQueryHook<
  UseGetDocumentAssessmentResultsByParentIdArgs,
  DocumentAssessmentResultsByParentIdResponseRow[],
  GetDocumentAssessmentResultsByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.assessment.documentAssessmentResultsByParentId.queryOptions({
      parentId,
    }),
  mapTrpcDataToGraphQL: mapTrpcDocumentAssessmentResultsToGraphQL,
  graphqlDocument: GetDocumentAssessmentResultsByParentIdDocument,
  graphqlVariables: ({ parentId }) => ({ ParentId: parentId }),
});
