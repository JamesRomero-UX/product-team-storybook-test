import type { ChangeRequestRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetChangeRequestsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetChangeRequestsArgs = {
  currentUserId: string;
};

/**
 * Maps TRPC appetite data to match the GraphQL query structure
 */
function mapChangeRequestsToGraphQl(
  trpcData: ChangeRequestRegisterResponse
): GetChangeRequestsQuery {
  return {
    change_request: trpcData.change_request.map((item) => ({
      ...item,
      currentUserOwnerList: item.parentOwnerAndContributors || [],
      parentOwners: item.parentOwnerAndContributors || [],
      responses: item.responses.flatMap((r) =>
        r.approver ? [{ ...r, approver: r.approver }] : []
      ),
      parent: item.parent
        ? {
            ...item.parent,
            documentFile: item.document_file
              ? {
                  Version: item.document_file.Version,
                  parent: item.document_file.parent,
                }
              : null,
            acceptance: item.acceptance,
            risk: item.risk,
            control: item.control,
            action: item.action,
            issue_assessment: item.issue_assessment,
          }
        : null,
    })),
  };
}

export const useGetChangeRequests = createQueryHook<
  UseGetChangeRequestsArgs,
  ChangeRequestRegisterResponse,
  GetChangeRequestsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.changeRequest.register.queryOptions(),
  mapTrpcDataToGraphQL: mapChangeRequestsToGraphQl,
  graphqlDocument: GetChangeRequestsDocument,
  graphqlVariables: ({ currentUserId }) => ({ currentUserId }),
});
