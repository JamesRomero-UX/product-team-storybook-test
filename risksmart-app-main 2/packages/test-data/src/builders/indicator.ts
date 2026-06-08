import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildIndicator = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'indicator'>>;
}): InferInsertModel<'indicator'> => ({
  Title: 'Test Indicator',
  Description: 'Test indicator description',
  Type: IndicatorType.Number,
  Unit: 'percentage',
  UpperToleranceNum: 100,
  LowerToleranceNum: 0,
  TargetValueTxt: 'On target',
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  CustomAttributeData: {},
  UpperAppetiteNum: 90,
  LowerAppetiteNum: 10,
  ...overrides,
});
