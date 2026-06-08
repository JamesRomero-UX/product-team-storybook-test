import type { GetRiskAssessmentResultImpactAuditByIdResponseRow } from '@risksmart-app/trpc/types';
import type { GetRiskAssessmentResultImpactAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskAssessmentResultImpactAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskAssessmentResultImpactAuditByIdArgs = { id: string };

export const useGetRiskAssessmentResultImpactAuditById = createQueryHook<
  UseGetRiskAssessmentResultImpactAuditByIdArgs,
  GetRiskAssessmentResultImpactAuditByIdResponseRow[],
  GetRiskAssessmentResultImpactAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.riskAssessmentResultImpactAudit.getById.queryOptions({
      id,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    risk_assessment_result_impact_audit: data || [],
  }),
  graphqlDocument: GetRiskAssessmentResultImpactAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ id }),
});
