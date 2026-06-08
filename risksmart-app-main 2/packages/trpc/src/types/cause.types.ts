import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getCauseByIdQueryConfig,
  getCauseRegisterQueryConfig,
  getCausesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/cause.query';

export type CauseRegisterResponseRow = InferQueryModel<
  'cause',
  typeof getCauseRegisterQueryConfig
>;

export type CausesByParentIssueIdResponseRow = InferQueryModel<
  'cause',
  typeof getCausesByParentIssueIdQueryConfig
>;

export type CauseByIdResponseRow = InferQueryModel<
  'cause',
  typeof getCauseByIdQueryConfig
>;
