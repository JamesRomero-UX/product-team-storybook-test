import type { TestResultsResponse } from '@risksmart-app/trpc/src/types';
import type {
  GetTestResultsQuery,
  Test_Result_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetTestResultsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import useEntityWhereFilter from 'src/hooks/useEntityWhereFilter';
import { createQueryHook } from 'src/utils';

type UseGetTestResultsArgs = Record<string, never>;

const useGetTestResultsGraphqlVariables = () => {
  const where = useEntityWhereFilter<Test_Result_Bool_Exp>(
    Parent_Type_Enum.TestResult,
    {
      RatingType: { _in: ['assessment', 'rating'] },
    }
  );

  return { where };
};

export const useGetTestResults = createQueryHook<
  UseGetTestResultsArgs,
  TestResultsResponse,
  GetTestResultsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.testResult.testResults.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ test_result: data.test_result }),
  graphqlDocument: GetTestResultsDocument,
  graphqlVariables: useGetTestResultsGraphqlVariables,
});
