import type { InternalAuditReportRiskAssessmentResultsByRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditReportRiskAssessmentResultsByRiskIdArgs = {
  riskId: string;
};

export const useGetInternalAuditReportRiskAssessmentResultsByRiskId =
  createQueryHook<
    UseGetInternalAuditReportRiskAssessmentResultsByRiskIdArgs,
    InternalAuditReportRiskAssessmentResultsByRiskIdResponse,
    GetInternalAuditReportRiskAssessmentResultsByRiskIdQuery
  >({
    trpcQueryOptions: (trpc, { riskId }) =>
      trpc.frontend.assessment.internalAuditReportRiskAssessmentResultsByRiskId.queryOptions(
        {
          riskId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => data,
    graphqlDocument:
      GetInternalAuditReportRiskAssessmentResultsByRiskIdDocument,
    graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
  });
