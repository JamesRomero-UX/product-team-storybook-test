import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getChangeRequestsRegisterQueryConfig,
  getPendingChangeRequestsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/change-request.query';

export type ChangeRequestResponseRow = InferQueryModel<
  'change_request',
  typeof getChangeRequestsRegisterQueryConfig
>;

export interface ChangeRequestRegisterResponse {
  change_request: ChangeRequestResponseRow[];
}

export type PendingChangeRequestResponseRow = InferQueryModel<
  'change_request',
  typeof getPendingChangeRequestsQueryConfig
>;
