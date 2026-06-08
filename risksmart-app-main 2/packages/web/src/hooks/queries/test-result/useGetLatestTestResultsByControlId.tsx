import type { TestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestTestResultsByControlIdArgs = { controlId: string };

export const useGetLatestTestResultsByControlId = createQueryHook<
  UseGetLatestTestResultsByControlIdArgs,
  TestResultsByControlIdResponse,
  GetLatestTestResultsByControlIdQuery
>({
  trpcQueryOptions: (trpc, { controlId }) =>
    trpc.frontend.testResult.latestTestResultsByControlId.queryOptions({
      controlId,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    test_result: data.test_result[0] ? [data.test_result[0]] : [],
  }),
  graphqlDocument: GetLatestTestResultsByControlIdDocument,
  graphqlVariables: ({ controlId }) => ({ controlId }),
});
