import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { document_assessment_result } from '@risksmart-app/drizzle/src/schema';

export const insertDocumentAssessmentResult = async (
  documentAssessmentResult: InferInsertModel<'document_assessment_result'>
) => {
  const db = await createDrizzleClient({
    tenant: 'testing',
    orgId: documentAssessmentResult.OrgKey,
    userId: documentAssessmentResult.CreatedByUser,
  });

  const [insertedDocumentAssessmentResult] = await db.org((tx) => {
    return tx
      .insert(document_assessment_result)
      .values(documentAssessmentResult)
      .returning();
  });

  return insertedDocumentAssessmentResult;
};
