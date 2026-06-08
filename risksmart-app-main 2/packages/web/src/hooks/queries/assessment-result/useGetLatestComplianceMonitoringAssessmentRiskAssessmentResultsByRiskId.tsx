import type { LatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdArgs =
  {
    riskId: string;
  };

export const useGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId =
  createQueryHook<
    UseGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdArgs,
    LatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse,
    GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery
  >({
    trpcQueryOptions: (trpc, { riskId }) =>
      trpc.frontend.assessment.latestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId.queryOptions(
        {
          riskId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => data,
    graphqlDocument:
      GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
    graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
  });
