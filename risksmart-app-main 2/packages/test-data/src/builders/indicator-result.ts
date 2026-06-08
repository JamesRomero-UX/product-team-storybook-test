import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildIndicatorResult = ({
  orgKey,
  userId,
  indicatorId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  indicatorId: string;
  overrides?: Partial<InferInsertModel<'indicator_result'>>;
}): InferInsertModel<'indicator_result'> => ({
  IndicatorId: indicatorId,
  Description: 'Test indicator result description',
  ResultDate: new Date().toISOString(),
  TargetValueTxt: null,
  TargetValueNum: 85,
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  CustomAttributeData: {},
  ...overrides,
});
