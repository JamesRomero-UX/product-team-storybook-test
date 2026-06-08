import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildTestResult = ({
  orgKey,
  userId,
  ParentControlId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  ParentControlId: string;
  overrides?: Partial<InferInsertModel<'test_result'>>;
}): Omit<InferInsertModel<'test_result'>, 'SequentialId'> => ({
  Title: 'Test Result',
  Submitter: userId,
  Description: 'Test result description',
  ParentControlId,
  TestType: 'businessLine',
  DesignEffectiveness: 2,
  PerformanceEffectiveness: 3,
  OverallEffectiveness: 2,
  TestDate: '2024-01-15T10:00:00Z',
  NextTestDate: '2025-01-15T10:00:00Z',
  OrgKey: orgKey,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  CustomAttributeData: {},
  RatingType: 'rating',
  ...overrides,
});
