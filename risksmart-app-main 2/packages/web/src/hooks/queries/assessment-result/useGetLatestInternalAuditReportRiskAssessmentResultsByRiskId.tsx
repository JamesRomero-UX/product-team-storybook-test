import type { LatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdArgs = {
  riskId: string;
};

export const useGetLatestInternalAuditReportRiskAssessmentResultsByRiskId =
  createQueryHook<
    UseGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdArgs,
    LatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse,
    GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery
  >({
    trpcQueryOptions: (trpc, { riskId }) =>
      trpc.frontend.assessment.latestInternalAuditReportRiskAssessmentResultsByRiskId.queryOptions(
        {
          riskId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => data,
    graphqlDocument:
      GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
    graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
  });
