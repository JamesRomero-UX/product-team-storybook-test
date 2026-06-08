import type { ComplianceMonitoringAssessmentTestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestComplianceMonitoringAssessmentTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestComplianceMonitoringAssessmentTestResultsByControlIdArgs = {
  controlId: string;
};

export const useGetLatestComplianceMonitoringAssessmentTestResultsByControlId =
  createQueryHook<
    UseGetLatestComplianceMonitoringAssessmentTestResultsByControlIdArgs,
    ComplianceMonitoringAssessmentTestResultsByControlIdResponse,
    GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery
  >({
    trpcQueryOptions: (trpc, { controlId }) =>
      trpc.frontend.testResult.latestComplianceMonitoringAssessmentTestResultsByControlId.queryOptions(
        { controlId }
      ),
    mapTrpcDataToGraphQL: (data) => ({
      control_test_second_line_result: data.control_test_second_line_result[0]
        ? [data.control_test_second_line_result[0]]
        : [],
    }),
    graphqlDocument:
      GetLatestComplianceMonitoringAssessmentTestResultsByControlIdDocument,
    graphqlVariables: ({ controlId }) => ({ controlId }),
  });
