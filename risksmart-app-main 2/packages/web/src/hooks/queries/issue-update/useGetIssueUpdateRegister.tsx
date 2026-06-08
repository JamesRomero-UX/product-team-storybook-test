import type { GetIssueUpdatesByParentIssueIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIssueUpdatesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssueUpdatesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssueUpdateRegisterArgs = { issueId: string };

export const useGetIssueUpdateRegister = createQueryHook<
  UseGetIssueUpdateRegisterArgs,
  GetIssueUpdatesByParentIssueIdResponseRow[],
  GetIssueUpdatesByParentIssueIdQuery
>({
  trpcQueryOptions: (trpc, { issueId }) =>
    trpc.frontend.issueUpdate.register.queryOptions({
      parentIssueId: issueId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ issue_update: data }),
  graphqlDocument: GetIssueUpdatesByParentIssueIdDocument,
  graphqlVariables: ({ issueId }) => ({ _eq: issueId }),
});
