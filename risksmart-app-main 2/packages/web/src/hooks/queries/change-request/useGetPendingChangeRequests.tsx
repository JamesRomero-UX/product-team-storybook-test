import type { PendingChangeRequestResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetPendingChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetPendingChangeRequestsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetPendingChangeRequestsArgs = {
  parentId: string;
};

const mapTrpcChangeRequestToGraphQL = (
  trpcData: PendingChangeRequestResponseRow[]
): GetPendingChangeRequestsQuery => {
  return {
    change_request: trpcData.map((pendingChangeRequest) => ({
      ...pendingChangeRequest,
      parent: pendingChangeRequest.parent && {
        ...pendingChangeRequest.parent,
        owners: pendingChangeRequest.parent?.ancestorContributors || [],
        documentFile: pendingChangeRequest.parent?.documentFile && {
          ...pendingChangeRequest.parent.documentFile,
          parent: pendingChangeRequest.parent.documentFile.parent && {
            ...pendingChangeRequest.parent.documentFile.parent,
            owners:
              pendingChangeRequest.parent.documentFile.parent
                ?.ancestorContributors || [],
          },
        },
        issue_assessment: pendingChangeRequest.parent?.issue_assessment && {
          ...pendingChangeRequest.parent.issue_assessment,
          parent: pendingChangeRequest.parent.issue_assessment.parent && {
            ...pendingChangeRequest.parent.issue_assessment.parent,
            owners:
              pendingChangeRequest.parent.issue_assessment.parent
                ?.ancestorContributors || [],
          },
        },
        acceptance: pendingChangeRequest.parent?.acceptance && {
          ...pendingChangeRequest.parent.acceptance,
          parents: pendingChangeRequest.parent.acceptance.parents
            .map((parent) =>
              parent.risk
                ? {
                    risk: {
                      ...parent.risk,
                      owners: parent.risk?.ancestorContributors || [],
                    },
                  }
                : null
            )
            .filter((parent) => parent !== null),
        },
      },
      responses: pendingChangeRequest.responses
        .filter((response) => response.approver !== null)
        .map((response) => ({
          ...response,
          approver: {
            ...response.approver!,
          },
        })),
    })),
  };
};

export const useGetPendingChangeRequests = createQueryHook<
  UseGetPendingChangeRequestsArgs,
  PendingChangeRequestResponseRow[],
  GetPendingChangeRequestsQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.changeRequest.pendingChangeRequests.queryOptions({
      parentId,
    }),
  mapTrpcDataToGraphQL: mapTrpcChangeRequestToGraphQL,
  graphqlDocument: GetPendingChangeRequestsDocument,
  graphqlVariables: ({ parentId }) => ({ ParentId: parentId }),
  graphqlFetchPolicy: 'network-only',
});
