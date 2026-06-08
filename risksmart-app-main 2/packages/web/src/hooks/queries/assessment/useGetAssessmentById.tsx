import type { GetAssessmentByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAssessmentByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAssessmentByIdArgs = {
  Id: string;
};

export const useGetAssessmentById = createQueryHook<
  UseGetAssessmentByIdArgs,
  GetAssessmentByIdResponseRow[],
  GetAssessmentByIdQuery
>({
  trpcQueryOptions: (trpc, { Id }) =>
    trpc.frontend.assessment.getById.queryOptions({ id: Id }),
  mapTrpcDataToGraphQL: (data) => ({ assessment: data }),
  graphqlDocument: GetAssessmentByIdDocument,
  graphqlVariables: ({ Id }) => ({ Id }),
});
