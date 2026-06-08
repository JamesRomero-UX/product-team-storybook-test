import type { ConsequenceByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetConsequencesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetConsequencesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetConsequencesByParentIssueIdArgs = {
  parentIssueId: string;
};

export const useGetConsequencesByParentIssueId = createQueryHook<
  UseGetConsequencesByParentIssueIdArgs,
  ConsequenceByIdResponseRow[],
  GetConsequencesByParentIssueIdQuery
>({
  trpcQueryOptions: (trpc, { parentIssueId }) =>
    trpc.frontend.consequence.getByParentIssueId.queryOptions({
      issueId: parentIssueId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ consequence: data }),
  graphqlDocument: GetConsequencesByParentIssueIdDocument,
  graphqlVariables: ({ parentIssueId }) => ({ _eq: parentIssueId }),
});
