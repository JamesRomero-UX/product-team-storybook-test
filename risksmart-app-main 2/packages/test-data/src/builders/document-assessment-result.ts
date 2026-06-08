import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildDocumentAssessmentResult = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'document_assessment_result'>>;
}): InferInsertModel<'document_assessment_result'> => ({
  Rating: 3,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  CustomAttributeData: {},
  Rationale: 'Test rationale',
  TestDate: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  RatingType: 'rating',
  ...overrides,
});
