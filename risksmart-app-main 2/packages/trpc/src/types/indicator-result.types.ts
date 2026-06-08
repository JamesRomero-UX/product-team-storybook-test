import type {
  InferQueryModel,
  InferSelectModel,
} from '@risksmart-app/drizzle/src/db';
import type { getIndicatorResultsByIndicatorIdQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';

export type GetIndicatorResultsByIndicatorIdResponseRow = InferQueryModel<
  'indicator_result',
  typeof getIndicatorResultsByIndicatorIdQueryConfig
>;

export type IndicatorResultResponseRow = InferQueryModel<
  'indicator_result',
  typeof getIndicatorResultsByIndicatorIdQueryConfig
>;

export type CreateIndicatorResultResponse =
  InferSelectModel<'indicator_result'>;

export interface UpdateIndicatorResultResponse {
  Id: string;
}
