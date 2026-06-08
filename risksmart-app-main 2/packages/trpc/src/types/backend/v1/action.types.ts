import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getActionListQueryConfig } from '@risksmart-app/drizzle/src/queries/action.query';

import type { GetActionByIdResponseRow } from '../../action.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type ActionListResponseRow = InferQueryModel<
  'action',
  typeof getActionListQueryConfig
>;

export interface ActionByIdResponse {
  action: GetActionByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
