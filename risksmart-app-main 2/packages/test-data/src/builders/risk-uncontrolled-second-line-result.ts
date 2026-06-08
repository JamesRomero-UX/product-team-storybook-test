import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRiskUncontrolledSecondLineResult = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'risk_uncontrolled_second_line_result'>>
): InferInsertModel<'risk_uncontrolled_second_line_result'> => ({
  Id: randomUUID(),
  TestDate: '2024-01-15T10:00:00Z',
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Rating: 5,
  ...overrides,
});
