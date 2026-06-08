import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getIndicatorByIdQueryConfig,
  getIndicatorRegisterQueryConfig,
  getIndicatorsByParentIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/indicator.query';

export type GetIndicatorByIdResponseRow = InferQueryModel<
  'indicator',
  typeof getIndicatorByIdQueryConfig
>;

export type IndicatorResponseRow = InferQueryModel<
  'indicator',
  typeof getIndicatorRegisterQueryConfig
>;

export type GetIndicatorsByParentIdResponseRow = InferQueryModel<
  'indicator',
  typeof getIndicatorsByParentIdQueryConfig
>;

export interface IndicatorItem extends GetIndicatorsByParentIdResponseRow {
  orderedResults: {
    TargetValueNum: number | null;
    TargetValueTxt: string | null;
    ResultDate: string;
  }[];
}

export interface GetIndicatorsByParentIdResponse {
  indicator: IndicatorItem[];
}
