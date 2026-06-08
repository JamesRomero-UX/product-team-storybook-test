import type { TestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetTestResultsByControlIdArgs = { controlId: string };

export const useGetTestResultsByControlId = createQueryHook<
  UseGetTestResultsByControlIdArgs,
  TestResultsByControlIdResponse,
  GetTestResultsByControlIdQuery
>({
  trpcQueryOptions: (trpc, { controlId }) =>
    trpc.frontend.testResult.testResultsByControlId.queryOptions({
      controlId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ test_result: data.test_result }),
  graphqlDocument: GetTestResultsByControlIdDocument,
  graphqlVariables: ({ controlId }) => ({ controlId }),
});
