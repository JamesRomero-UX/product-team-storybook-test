import type { AssessmentActivityRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetAssessmentActivitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentActivitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAssessmentActivitiesRegisterArgs = Record<string, never>;

export const useGetAssessmentActivitiesRegister = createQueryHook<
  UseGetAssessmentActivitiesRegisterArgs,
  AssessmentActivityRegisterResponse,
  GetAssessmentActivitiesQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.assessment.activityRegister.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    assessment_activity: data.assessment_activity,
  }),
  graphqlDocument: GetAssessmentActivitiesDocument,
});
