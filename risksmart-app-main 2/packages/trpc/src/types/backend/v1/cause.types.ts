import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getCauseByIdQueryConfig,
  getCausesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/cause.query';

import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type CauseListResponseRow = InferQueryModel<
  'cause',
  typeof getCausesByParentIssueIdQueryConfig
>;

export type CauseByIdResponseRow = InferQueryModel<
  'cause',
  typeof getCauseByIdQueryConfig
>;

export interface CauseByIdResponse {
  cause: CauseByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
