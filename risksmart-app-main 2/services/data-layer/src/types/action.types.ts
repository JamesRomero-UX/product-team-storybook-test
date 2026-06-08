import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getActionByIdQueryConfig,
  getActionsRegisterQueryConfig,
  getActionUpdateByIdQueryConfig,
  getActionUpdatesByParentActionIdQueryConfig,
  getMyDueItemsActionsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';

export type ActionRegisterResponseRow = InferQueryModel<
  'action',
  typeof getActionsRegisterQueryConfig
>;

export type GetActionByIdResponseRow = InferQueryModel<
  'action',
  typeof getActionByIdQueryConfig
>;

export type GetActionUpdatesByParentActionIdResponseRow = InferQueryModel<
  'action_update',
  typeof getActionUpdatesByParentActionIdQueryConfig
>;

export type GetActionUpdateByIdResponseRow = InferQueryModel<
  'action_update',
  typeof getActionUpdateByIdQueryConfig
>;

export type GetMyDueItemsActionsResponseRow = InferQueryModel<
  'action',
  typeof getMyDueItemsActionsQueryConfig
>;
