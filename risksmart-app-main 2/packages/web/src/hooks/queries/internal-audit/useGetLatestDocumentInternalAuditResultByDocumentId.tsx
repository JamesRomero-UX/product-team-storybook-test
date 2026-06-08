import type { GetLatestDocumentInternalAuditResultByDocumentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestDocumentInternalAuditResultByDocumentIdArgs = {
  documentId: string;
};

export const useGetLatestDocumentInternalAuditResultByDocumentId =
  createQueryHook<
    UseGetLatestDocumentInternalAuditResultByDocumentIdArgs,
    GetLatestDocumentInternalAuditResultByDocumentIdResponseRow[],
    GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery
  >({
    trpcQueryOptions: (trpc, { documentId }) =>
      trpc.frontend.internalAuditResult.latestDocumentInternalAuditResultByDocumentId.queryOptions(
        { documentId }
      ),
    mapTrpcDataToGraphQL: (data) => ({
      document_internal_audit_result: data,
    }),
    graphqlDocument:
      GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdDocument,
    graphqlVariables: ({ documentId }) => ({ DocumentId: documentId }),
  });
