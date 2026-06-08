import type { GetIssueAssessmentByParentIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetIssueAssessmentByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssueAssessmentByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssueAssessmentsByParentIdArgs = {
  parentIssueId: string;
};

export const useGetIssueAssessmentsByParentId = createQueryHook<
  UseGetIssueAssessmentsByParentIdArgs,
  GetIssueAssessmentByParentIdResponse,
  GetIssueAssessmentByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentIssueId }) =>
    trpc.frontend.issue.issueAssessmentByParentId.queryOptions({
      parentIssueId,
    }),
  mapTrpcDataToGraphQL: (data) => data,
  graphqlDocument: GetIssueAssessmentByParentIdDocument,
  graphqlVariables: ({ parentIssueId }) => ({ parentIssueId }),
});
