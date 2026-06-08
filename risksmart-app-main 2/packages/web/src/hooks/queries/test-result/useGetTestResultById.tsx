import type { TestResultByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetTestResultByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTestResultByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetTestResultByIdArgs = { testResultId: string };

export const useGetTestResultById = createQueryHook<
  UseGetTestResultByIdArgs,
  TestResultByIdResponseRow[],
  GetTestResultByIdQuery
>({
  trpcQueryOptions: (trpc, { testResultId }) =>
    trpc.frontend.testResult.testResultById.queryOptions({ testResultId }),
  mapTrpcDataToGraphQL: (data) => ({ test_result: data }),
  graphqlDocument: GetTestResultByIdDocument,
  graphqlVariables: ({ testResultId }) => ({ Id: testResultId }),
});
