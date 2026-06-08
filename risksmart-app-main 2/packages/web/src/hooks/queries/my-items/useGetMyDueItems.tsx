import type { MyDueItemsResponse } from '@risksmart-app/trpc/src/types';
import type { GetMyDueItemsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mapTrpcMyDueItemsToGraphQL = (
  trpcData: MyDueItemsResponse
): GetMyDueItemsQuery => {
  return {
    action: trpcData.action,
    assessment: trpcData.assessment,
    control: trpcData.control,
    document: trpcData.document,
    indicator: trpcData.indicator,
    issue: trpcData.issue,
    obligation: trpcData.obligation,
    risk: trpcData.risk,
    assessment_activity: trpcData.assessmentActivity,
    attestation_record: trpcData.attestationRecord,
    change_request: trpcData.changeRequest.map((cr) => ({
      ...cr,
      responses: cr.responses
        .filter((r) => r.approver !== null)
        .map((r) => ({
          ...r,
          approver: r.approver!,
        })),
    })),
  } as GetMyDueItemsQuery;
};
