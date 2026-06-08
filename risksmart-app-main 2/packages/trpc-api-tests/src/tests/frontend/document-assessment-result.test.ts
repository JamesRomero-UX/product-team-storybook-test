import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import {
  buildAssessment,
  buildAssessmentResultParent,
  buildDocument,
  buildDocumentAssessmentResult,
  insertAssessment,
  insertAssessmentResultParent,
  insertDocument,
  insertDocumentAssessmentResult,
} from '@risksmart-app/test-data';
import { randomUUID } from 'crypto';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestContext } from '../../utils/test-context';

describe('DocumentAssessmentResult', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('documentAssessmentResultsByParentId', () => {
    it('should return document assessment results filtered by parent ID', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document (parent item)
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create an assessment
      const assessmentId = randomUUID();
      const assessment = buildAssessment(orgKey, userId, { Id: assessmentId });
      await insertAssessment(assessment);

      // Create a document assessment result
      const documentAssessmentResultId = randomUUID();
      const documentAssessmentResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: documentAssessmentResultId,
          Rating: 4,
          RatingType: 'rating',
          Rationale: 'Test rationale for document assessment',
          TestDate: '2024-01-15T10:00:00Z',
        },
      });
      await insertDocumentAssessmentResult(documentAssessmentResult);

      // Create parent relationship linking the result to the document
      const resultToDocumentParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: documentId,
        overrides: {
          Id: documentAssessmentResultId,
          ResultType: ParentTypes.DocumentAssessmentResult,
          ParentType: ParentTypes.Document,
        },
      });
      await insertAssessmentResultParent(resultToDocumentParent);

      // Create parent relationship linking the result to the assessment
      const resultToAssessmentParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: assessmentId,
        overrides: {
          Id: documentAssessmentResultId,
          ResultType: ParentTypes.DocumentAssessmentResult,
          ParentType: ParentTypes.Assessment,
        },
      });
      await insertAssessmentResultParent(resultToAssessmentParent);

      // Query by document parent ID
      const response =
        await trpcClient.frontend.assessment.documentAssessmentResultsByParentId.query(
          { parentId: documentId }
        );

      expect(response).toHaveLength(1);
      const firstResult = response[0];
      expect(firstResult).toBeDefined();
      expect(firstResult).toEqual(
        expect.objectContaining({
          Id: documentAssessmentResultId,
          Rating: 4,
          Rationale: 'Test rationale for document assessment',
          TestDate: documentAssessmentResult.TestDate,
          CustomAttributeData: documentAssessmentResult.CustomAttributeData,
          files: [],
        })
      );

      // Verify the parents relationship (should only include assessment type parent)
      expect(firstResult?.parents).toHaveLength(1);
      const firstParent = firstResult?.parents[0];
      expect(firstParent).toBeDefined();
      expect(firstParent?.assessment).toEqual(
        expect.objectContaining({
          Id: assessmentId,
          Title: assessment.Title,
          Summary: assessment.Summary,
          Status: assessment.Status,
        })
      );
    });

    it('should return empty array when no results exist for the parent ID', async () => {
      const { trpcClient } = context;

      const nonExistentParentId = randomUUID();

      const response =
        await trpcClient.frontend.assessment.documentAssessmentResultsByParentId.query(
          { parentId: nonExistentParentId }
        );

      expect(response).toHaveLength(0);
    });

    it('should only return results with RatingType assessment or rating', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document (parent item)
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create an assessment
      const assessmentId = randomUUID();
      const assessment = buildAssessment(orgKey, userId, { Id: assessmentId });
      await insertAssessment(assessment);

      // Create result with valid RatingType 'rating'
      const validRatingResultId = randomUUID();
      const validRatingResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: validRatingResultId,
          Rating: 4,
          RatingType: 'rating',
        },
      });
      await insertDocumentAssessmentResult(validRatingResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: validRatingResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: validRatingResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      // Create result with valid RatingType 'assessment'
      const validAssessmentResultId = randomUUID();
      const validAssessmentResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: validAssessmentResultId,
          Rating: 3,
          RatingType: 'assessment',
        },
      });
      await insertDocumentAssessmentResult(validAssessmentResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: validAssessmentResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: validAssessmentResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      // Create result with invalid RatingType (should be excluded)
      const invalidResultId = randomUUID();
      const invalidResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: invalidResultId,
          Rating: 1,
          RatingType: 'other_type',
        },
      });
      await insertDocumentAssessmentResult(invalidResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: invalidResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: invalidResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.documentAssessmentResultsByParentId.query(
          { parentId: documentId }
        );

      // Should only return results with valid RatingType
      expect(response).toHaveLength(2);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: validRatingResultId,
            Rating: 4,
          }),
          expect.objectContaining({
            Id: validAssessmentResultId,
            Rating: 3,
          }),
        ])
      );
    });

    it('should return multiple results for the same parent ID', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a document (parent item)
      const documentId = randomUUID();
      const document = buildDocument(orgKey, userId, { Id: documentId });
      await insertDocument(document);

      // Create an assessment
      const assessmentId = randomUUID();
      const assessment = buildAssessment(orgKey, userId, { Id: assessmentId });
      await insertAssessment(assessment);

      // Create first result
      const firstResultId = randomUUID();
      const firstResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: firstResultId,
          Rating: 2,
          RatingType: 'rating',
          TestDate: '2024-01-10T10:00:00Z',
        },
      });
      await insertDocumentAssessmentResult(firstResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: firstResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: firstResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      // Create second result
      const secondResultId = randomUUID();
      const secondResult = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: secondResultId,
          Rating: 5,
          RatingType: 'assessment',
          TestDate: '2024-02-15T10:00:00Z',
        },
      });
      await insertDocumentAssessmentResult(secondResult);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: documentId,
          overrides: {
            Id: secondResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: secondResultId,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      const response =
        await trpcClient.frontend.assessment.documentAssessmentResultsByParentId.query(
          { parentId: documentId }
        );

      expect(response).toHaveLength(2);
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Id: firstResultId,
            Rating: 2,
          }),
          expect.objectContaining({
            Id: secondResultId,
            Rating: 5,
          }),
        ])
      );
    });

    it('should not return results from other parent IDs', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create two documents
      const document1Id = randomUUID();
      const document1 = buildDocument(orgKey, userId, { Id: document1Id });
      await insertDocument(document1);

      const document2Id = randomUUID();
      const document2 = buildDocument(orgKey, userId, { Id: document2Id });
      await insertDocument(document2);

      // Create an assessment
      const assessmentId = randomUUID();
      const assessment = buildAssessment(orgKey, userId, { Id: assessmentId });
      await insertAssessment(assessment);

      // Create result for document 1
      const result1Id = randomUUID();
      const result1 = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: result1Id,
          Rating: 3,
          RatingType: 'rating',
        },
      });
      await insertDocumentAssessmentResult(result1);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: document1Id,
          overrides: {
            Id: result1Id,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: result1Id,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      // Create result for document 2
      const result2Id = randomUUID();
      const result2 = buildDocumentAssessmentResult({
        orgKey,
        userId,
        overrides: {
          Id: result2Id,
          Rating: 4,
          RatingType: 'rating',
        },
      });
      await insertDocumentAssessmentResult(result2);
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: document2Id,
          overrides: {
            Id: result2Id,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Document,
          },
        })
      );
      await insertAssessmentResultParent(
        buildAssessmentResultParent({
          orgKey,
          userId,
          parentId: assessmentId,
          overrides: {
            Id: result2Id,
            ResultType: ParentTypes.DocumentAssessmentResult,
            ParentType: ParentTypes.Assessment,
          },
        })
      );

      // Query for document 1 results
      const response =
        await trpcClient.frontend.assessment.documentAssessmentResultsByParentId.query(
          { parentId: document1Id }
        );

      // Should only return result 1
      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: result1Id,
          Rating: 3,
        })
      );
    });
  });
});
