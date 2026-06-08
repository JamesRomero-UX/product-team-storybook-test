import type {
  AssessmentRegisterResponse,
  AssessmentRegisterResponseRow,
} from '@risksmart-app/trpc/src/types';
import type {
  Assessment_Bool_Exp,
  GetAssessmentsQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAssessmentsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useAssessmentsGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Assessment_Bool_Exp>(
    Parent_Type_Enum.Assessment
  );

  return { where: whereFilter };
};

const mapTrpcAssessmentToGraphQL = (
  assessment: AssessmentRegisterResponseRow
): GetAssessmentsQuery['assessment'][number] => {
  return {
    ...assessment,
    assessedItems: assessment.assessmentResults,
  };
};

/**
 * Maps TRPC assessment data to match the GraphQL query structure
 */
export function mapTrpcAssessmentsToGraphQL(
  trpcData: AssessmentRegisterResponse
): GetAssessmentsQuery {
  return {
    assessment: trpcData.assessment.map((assessment) =>
      mapTrpcAssessmentToGraphQL(assessment)
    ),
  };
}

type UseGetAssessmentsRegisterArgs = Record<string, never>;

export const useGetAssessmentsRegister = createQueryHook<
  UseGetAssessmentsRegisterArgs,
  AssessmentRegisterResponse,
  GetAssessmentsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.assessment.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcAssessmentsToGraphQL,
  graphqlDocument: GetAssessmentsDocument,
  graphqlVariables: useAssessmentsGraphqlVariables,
});
