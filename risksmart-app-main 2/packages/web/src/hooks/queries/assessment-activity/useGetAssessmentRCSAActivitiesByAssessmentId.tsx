import type { AssessmentRCSAActivityByAssessmentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAssessmentRcsaActivitiesByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentRcsaActivitiesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAssessmentRCSAActivitiesByAssessmentIdArgs = {
  assessmentId: string;
};

export const useGetAssessmentRCSAActivitiesByAssessmentId = createQueryHook<
  UseGetAssessmentRCSAActivitiesByAssessmentIdArgs,
  AssessmentRCSAActivityByAssessmentIdResponseRow[],
  GetAssessmentRcsaActivitiesByParentIdQuery
>({
  trpcQueryOptions: (trpc, { assessmentId }) =>
    trpc.frontend.assessment.assessmentRCSAActivitiesByAssessmentId.queryOptions(
      { assessmentId }
    ),
  mapTrpcDataToGraphQL: (data) => ({ assessment_activity: data }),
  graphqlDocument: GetAssessmentRcsaActivitiesByParentIdDocument,
  graphqlVariables: ({ assessmentId }) => ({ AssessmentId: assessmentId }),
});
