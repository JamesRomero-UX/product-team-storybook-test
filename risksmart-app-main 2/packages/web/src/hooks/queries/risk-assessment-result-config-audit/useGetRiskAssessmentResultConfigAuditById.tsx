import type { GetRiskAssessmentResultConfigAuditByIdResponseRow } from '@risksmart-app/trpc/types';
import type { GetRiskAssessmentResultConfigAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskAssessmentResultConfigAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskAssessmentResultConfigAuditByIdArgs = { id: string };

export const useGetRiskAssessmentResultConfigAuditById = createQueryHook<
  UseGetRiskAssessmentResultConfigAuditByIdArgs,
  GetRiskAssessmentResultConfigAuditByIdResponseRow[],
  GetRiskAssessmentResultConfigAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.riskAssessmentResultConfigAudit.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({
    risk_assessment_result_config_audit: data || [],
  }),
  graphqlDocument: GetRiskAssessmentResultConfigAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ id }),
});
