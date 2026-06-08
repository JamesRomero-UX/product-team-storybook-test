import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getActionByIdQueryConfig,
  getActionsByInternalAuditReportIdQueryConfig,
  getActionsRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';

export type GetActionByIdResponseRow = InferQueryModel<
  'action',
  typeof getActionByIdQueryConfig
>;

export type ActionRegisterResponseRow = InferQueryModel<
  'action',
  typeof getActionsRegisterQueryConfig
>;

export type GetActionsByInternalAuditReportIdResponseRow = InferQueryModel<
  'action',
  typeof getActionsByInternalAuditReportIdQueryConfig
>;

export type GetActionsByInternalAuditReportIdResponse =
  GetActionsByInternalAuditReportIdResponseRow & {
    updates_aggregate: {
      aggregate: {
        count: number;
      };
    };
  };

export interface CreateActionResponse {
  Id: string;
}
