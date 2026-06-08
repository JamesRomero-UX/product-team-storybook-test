import type { GetIssueUpdateAuditByIdResponseRow } from '@risksmart-app/trpc/types';
import type { GetIssueUpdateAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssueUpdateAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssueUpdateAuditByIdArgs = { id: string };

export const useGetIssueUpdateAuditById = createQueryHook<
  UseGetIssueUpdateAuditByIdArgs,
  GetIssueUpdateAuditByIdResponseRow[],
  GetIssueUpdateAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.issueUpdateAudit.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ issue_update_audit: data }),
  graphqlDocument: GetIssueUpdateAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
