import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getActionUpdateByIdQueryConfig,
  getActionUpdatesByParentActionIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';

export type GetActionUpdatesByParentActionIdResponseRow = InferQueryModel<
  'action_update',
  typeof getActionUpdatesByParentActionIdQueryConfig
>;

export type GetActionUpdateByIdResponseRow = InferQueryModel<
  'action_update',
  typeof getActionUpdateByIdQueryConfig
>;

/**
 * Response from creating an action update
 * The data-layer returns the full created entity
 */
export type CreateActionUpdateResponse = GetActionUpdateByIdResponseRow;
