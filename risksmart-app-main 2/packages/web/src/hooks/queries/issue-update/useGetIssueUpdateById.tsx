import type { GetIssueUpdateByIdResponseRow } from '@risksmart-app/trpc/types';
import type { GetIssueUpdateByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssueUpdateByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssueUpdateByIdArgs = { id: string };

export const useGetIssueUpdateById = createQueryHook<
  UseGetIssueUpdateByIdArgs,
  GetIssueUpdateByIdResponseRow[],
  GetIssueUpdateByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.issueUpdate.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ issue_update: data || [] }),
  graphqlDocument: GetIssueUpdateByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
