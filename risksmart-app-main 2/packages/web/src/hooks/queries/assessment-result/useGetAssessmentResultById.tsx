import type { AssessmentResultParentByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAssessmentResultByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentResultByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAssessmentResultByIdArgs = {
  id: string;
};

export const useGetAssessmentResultById = createQueryHook<
  UseGetAssessmentResultByIdArgs,
  AssessmentResultParentByIdResponseRow[],
  GetAssessmentResultByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.assessment.resultParents.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ assessment_result_parent: data }),
  graphqlDocument: GetAssessmentResultByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
