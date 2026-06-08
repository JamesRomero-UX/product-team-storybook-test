import {
  buildImpact,
  buildImpactRating,
  buildRisk,
  insertImpact,
  insertImpactRating,
  insertRisk,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('impact', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('latestImpactRatingsForRatedImpactsByRatedItemId', () => {
    it('should return the impact with its ratings', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk to use as the rated item
      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create an impact rating linking the impact to the risk
      const impactRatingInput = buildImpactRating({
        orgKey,
        userId,
        impactId: insertedImpact.Id,
        ratedItemId: insertedRisk.Id,
        overrides: {
          Rating: 4,
          Likelihood: 3,
        },
      });
      const insertedImpactRating = await insertImpactRating(impactRatingInput);

      if (!insertedImpactRating) {
        throw new Error('Failed to insert impact rating');
      }

      const response =
        await trpcClient.frontend.impact.latestImpactRatingsForRatedImpactsByRatedItemId.query(
          {
            ratedItemId: insertedImpactRating.RatedItemId,
          }
        );

      expect(response.length).toEqual(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: insertedImpact.Id,
          Name: impactInput.Name,
          Rationale: impactInput.Rationale,
        })
      );
      expect(response[0]?.ratings.length).toEqual(1);
      expect(response[0]?.ratings[0]).toEqual(
        expect.objectContaining({
          Id: insertedImpactRating.Id,
          Rating: impactRatingInput.Rating,
          Likelihood: impactRatingInput.Likelihood,
          ImpactId: insertedImpact.Id,
          RatedItemId: insertedRisk.Id,
        })
      );
    });

    it('should only return latest rating ordered by TestDate descending', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk to use as the rated item
      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create older impact rating
      const olderRating = buildImpactRating({
        orgKey,
        userId,
        impactId: insertedImpact.Id,
        ratedItemId: insertedRisk.Id,
        overrides: {
          Rating: 2,
          TestDate: '2024-01-01T10:00:00Z',
        },
      });
      await insertImpactRating(olderRating);

      // Create newer impact rating
      const newerRating = buildImpactRating({
        orgKey,
        userId,
        impactId: insertedImpact.Id,
        ratedItemId: insertedRisk.Id,
        overrides: {
          Rating: 5,
          TestDate: '2024-06-01T10:00:00Z',
        },
      });
      const insertedNewerRating = await insertImpactRating(newerRating);

      if (!insertedNewerRating) {
        throw new Error('Failed to insert newer rating');
      }

      const response =
        await trpcClient.frontend.impact.latestImpactRatingsForRatedImpactsByRatedItemId.query(
          {
            ratedItemId: insertedNewerRating.RatedItemId,
          }
        );

      expect(response.length).toEqual(1);
      expect(response[0]?.ratings.length).toEqual(1);
      expect(response[0]?.ratings[0]?.Rating).toEqual(5);
    });

    it('should only return ratings with RatingType assessment or rating', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a risk to use as the rated item
      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create an impact
      const impactInput = buildImpact({
        orgKey,
        userId,
      });
      const insertedImpact = await insertImpact(impactInput);

      if (!insertedImpact) {
        throw new Error('Failed to insert impact');
      }

      // Create rating with invalid RatingType (should be filtered out)
      const invalidRating = buildImpactRating({
        orgKey,
        userId,
        impactId: insertedImpact.Id,
        ratedItemId: insertedRisk.Id,
        overrides: {
          Rating: 1,
          RatingType: 'internal_audit',
        },
      });
      await insertImpactRating(invalidRating);

      const response =
        await trpcClient.frontend.impact.latestImpactRatingsForRatedImpactsByRatedItemId.query(
          {
            ratedItemId: invalidRating.RatedItemId,
          }
        );

      expect(response.length).toEqual(0);
    });

    it('should return empty array when impact does not exist', async () => {
      const { trpcClient } = context;

      const nonExistentImpactId = '00000000-0000-0000-0000-000000000000';

      const response =
        await trpcClient.frontend.impact.latestImpactRatingsForRatedImpactsByRatedItemId.query(
          {
            ratedItemId: nonExistentImpactId,
          }
        );

      expect(response).toEqual([]);
    });
  });
});
