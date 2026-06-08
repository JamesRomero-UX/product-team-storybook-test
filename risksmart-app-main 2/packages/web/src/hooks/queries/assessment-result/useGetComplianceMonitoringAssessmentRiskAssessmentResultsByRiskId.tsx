import type { ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdArgs = {
  riskId: string;
};

export const useGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId =
  createQueryHook<
    UseGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdArgs,
    ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse,
    GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery
  >({
    trpcQueryOptions: (trpc, { riskId }) =>
      trpc.frontend.assessment.complianceMonitoringAssessmentRiskAssessmentResultsByRiskId.queryOptions(
        {
          riskId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => data,
    graphqlDocument:
      GetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdDocument,
    graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
  });
