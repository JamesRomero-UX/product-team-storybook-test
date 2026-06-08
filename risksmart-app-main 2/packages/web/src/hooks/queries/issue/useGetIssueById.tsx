import type { GetIssueByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIssueByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssueByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssueByIdArgs = {
  id: string;
};

export const useGetIssueById = createQueryHook<
  UseGetIssueByIdArgs,
  GetIssueByIdResponseRow[],
  GetIssueByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.issue.issueById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ issue: data }),
  graphqlDocument: GetIssueByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
