import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsChangeRequestsQueryConfig } from '@risksmart-app/drizzle/src/queries/change-request.query';

type ChangeRequestQueryResult = InferQueryModel<
  'change_request',
  typeof getMyDueItemsChangeRequestsQueryConfig
>;

export type GetMyDueItemsChangeRequestsResponseRow =
  ChangeRequestQueryResult & {
    currentUserOwnerList: {
      UserId: string | null;
    }[];
  };
