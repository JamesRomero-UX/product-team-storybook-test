import type { ComplianceMonitoringAssessmentTestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetComplianceMonitoringAssessmentTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetComplianceMonitoringAssessmentTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetComplianceMonitoringAssessmentTestResultsByControlIdArgs = {
  controlId: string;
};

export const useGetComplianceMonitoringAssessmentTestResultsByControlId =
  createQueryHook<
    UseGetComplianceMonitoringAssessmentTestResultsByControlIdArgs,
    ComplianceMonitoringAssessmentTestResultsByControlIdResponse,
    GetComplianceMonitoringAssessmentTestResultsByControlIdQuery
  >({
    trpcQueryOptions: (trpc, { controlId }) =>
      trpc.frontend.testResult.complianceMonitoringAssessmentTestResultsByControlId.queryOptions(
        {
          controlId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => ({
      control_test_second_line_result: data.control_test_second_line_result,
    }),
    graphqlDocument:
      GetComplianceMonitoringAssessmentTestResultsByControlIdDocument,
    graphqlVariables: ({ controlId }) => ({ controlId }),
  });
