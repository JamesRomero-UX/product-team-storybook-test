import type { AssessmentActivitiesByParentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAssessmentActivitiesByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentActivitiesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAssessmentActivitiesByParentIdArgs = {
  id: string;
};

export const useGetAssessmentActivitiesByParentId = createQueryHook<
  UseGetAssessmentActivitiesByParentIdArgs,
  AssessmentActivitiesByParentIdResponseRow[],
  GetAssessmentActivitiesByParentIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.assessment.assessmentActivitiesByParentId.queryOptions({
      id,
    }),
  mapTrpcDataToGraphQL: (data) => ({ assessment_activity: data }),
  graphqlDocument: GetAssessmentActivitiesByParentIdDocument,
  graphqlVariables: ({ id }) => ({ AssessmentId: id }),
});
