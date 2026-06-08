import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type {
  IssueRegisterResponse,
  IssueRegisterResponseRow,
} from '@risksmart-app/trpc/src/types';
import type {
  GetIssuesQuery,
  Issue_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetIssuesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import useEntityWhereFilter from 'src/hooks/useEntityWhereFilter';
import { createQueryHook } from 'src/utils';

function mapTrpcIssueToGraphQL(
  issue: IssueRegisterResponseRow
): GetIssuesQuery['issue'][number] {
  return {
    ...issue,
    actions_aggregate: {
      aggregate: {
        count: issue.actions.length,
      },
    },
  };
}

/**
 * Maps TRPC issue data to match the GraphQL query structure
 * Exported for use in data sources
 */
export function mapTrpcIssuesToGraphQL(
  trpcData: IssueRegisterResponse | undefined
): GetIssuesQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    issue: trpcData.issue.map((issue) => mapTrpcIssueToGraphQL(issue)),
  };
}

const useIssueRegisterGraphqlVariables = ({
  issueType,
}: UseGetIssueRegisterArgs) => {
  const where = useEntityWhereFilter<Issue_Bool_Exp>(Parent_Type_Enum.Issue, {
    Type: {
      _eq: issueType,
    },
  });

  return { where };
};

type UseGetIssueRegisterArgs = {
  issueType: ParentIssueType;
};

export const useGetIssueRegister = createQueryHook<
  UseGetIssueRegisterArgs,
  IssueRegisterResponse,
  GetIssuesQuery
>({
  trpcQueryOptions: (trpc, { issueType }) =>
    trpc.frontend.issue.register.queryOptions({ issueType }),
  mapTrpcDataToGraphQL: (data) => ({
    issue: data.issue.map((issue) => mapTrpcIssueToGraphQL(issue)),
  }),
  graphqlDocument: GetIssuesDocument,
  graphqlVariables: useIssueRegisterGraphqlVariables,
});
