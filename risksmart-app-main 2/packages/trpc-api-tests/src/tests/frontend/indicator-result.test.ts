import {
  buildIndicator,
  buildIndicatorResult,
  insertIndicator,
  insertIndicatorResult,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('indicator-result', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('indicator results', () => {
    describe('get indicator results by indicator id', () => {
      it('should return empty list when no indicator results exist', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response).toEqual([]);
      });

      it('should return all indicator results for the given indicator', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Create an indicator result
        const indicatorResultInput = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
        });
        const insertedIndicatorResult =
          await insertIndicatorResult(indicatorResultInput);

        if (!insertedIndicatorResult) {
          throw new Error('Failed to insert indicator result');
        }

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response.length).toEqual(1);
        expect(response[0]).toEqual(
          expect.objectContaining({
            Id: insertedIndicatorResult.Id,
            Description: indicatorResultInput.Description,
          })
        );
      });

      it('should return multiple indicator results for the same indicator', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Create multiple indicator results
        const result1 = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
          overrides: { Description: 'Result 1', TargetValueNum: 80 },
        });
        const result2 = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
          overrides: { Description: 'Result 2', TargetValueNum: 90 },
        });

        await insertIndicatorResult(result1);
        await insertIndicatorResult(result2);

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response.length).toEqual(2);
        expect(response.map((r) => r.Description)).toContain('Result 1');
        expect(response.map((r) => r.Description)).toContain('Result 2');
      });

      it('should not return indicator results for a different indicator', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create two indicators
        const indicator1Input = buildIndicator({
          orgKey,
          userId,
          overrides: { Title: 'Indicator 1' },
        });
        const indicator2Input = buildIndicator({
          orgKey,
          userId,
          overrides: { Title: 'Indicator 2' },
        });

        const insertedIndicator1 = await insertIndicator(indicator1Input);
        const insertedIndicator2 = await insertIndicator(indicator2Input);

        if (!insertedIndicator1 || !insertedIndicator2) {
          throw new Error('Failed to insert indicators');
        }

        // Create indicator result for indicator 1 only
        const indicatorResultInput = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator1.Id,
        });
        await insertIndicatorResult(indicatorResultInput);

        // Query results for indicator 2 - should be empty
        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator2.Id,
            }
          );

        expect(response).toEqual([]);
      });

      it('should not return OrgKey field', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Create an indicator result
        const indicatorResultInput = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
        });
        await insertIndicatorResult(indicatorResultInput);

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response.length).toEqual(1);
        // OrgKey should be excluded based on the indicatorResult fragment
        expect(response[0]).not.toHaveProperty('OrgKey');
      });

      it('should return indicator result with custom attribute data', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const customData = { source: 'manual', verified: true };
        const indicatorResultInput = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
          overrides: {
            CustomAttributeData: customData,
          },
        });
        await insertIndicatorResult(indicatorResultInput);

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response.length).toEqual(1);
        expect(response[0]?.CustomAttributeData).toEqual(customData);
      });

      it('should return indicator results with numeric target values', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const indicatorResultInput = buildIndicatorResult({
          orgKey,
          userId,
          indicatorId: insertedIndicator.Id,
          overrides: {
            TargetValueNum: 95.5,
          },
        });
        await insertIndicatorResult(indicatorResultInput);

        const response =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(response.length).toEqual(1);
        expect(response[0]?.TargetValueNum).toEqual(95.5);
      });
    });

    describe('insert indicator result', () => {
      it('should insert a new indicator result', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const response =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            Description: 'New indicator result',
            TargetValueNum: 95,
          });

        // Async request returns an ID immediately
        expect(response.Id).toBeDefined();
      });

      it('should insert indicator result with custom attribute data', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const response =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            Description: 'Result with custom data',
            TargetValueNum: 90,
            CustomAttributeData: {
              source: 'manual',
              verified: true,
            },
          });

        expect(response.Id).toBeDefined();
      });

      it('should insert indicator result with text target value', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const response =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            TargetValueTxt: 'On target',
          });

        expect(response.Id).toBeDefined();
      });

      it('should reject insertion with both numeric and text target values', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Database constraint requires exactly one of TargetValueNum or TargetValueTxt
        await expect(
          trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            Description: 'Complete result',
            TargetValueNum: 85,
            TargetValueTxt: 'Above threshold',
          })
        ).rejects.toThrow(
          'Exactly one of TargetValueNum or TargetValueTxt must be provided'
        );
      });

      it('should reject insertion with neither numeric nor text target value', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Database constraint requires exactly one of TargetValueNum or TargetValueTxt
        await expect(
          trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            Description: 'Result without target value',
          })
        ).rejects.toThrow(
          'Exactly one of TargetValueNum or TargetValueTxt must be provided'
        );
      });

      it('should reject insertion with non-existent indicator ID', async () => {
        const { trpcClient } = context;

        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        await expect(
          trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: nonExistentId,
            ResultDate: '2026-01-30T12:00:00.000Z',
            TargetValueNum: 50,
          })
        ).rejects.toThrow(
          `IndicatorId '${nonExistentId}' does not reference an existing indicator`
        );
      });

      it('should reject insertion with invalid date format', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create an indicator first
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Try to insert with invalid date format - should fail Zod validation
        // TypeScript doesn't catch this because the string passes type checking
        // but Zod will validate the datetime format at runtime
        await expect(
          trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: 'not-a-date',
            TargetValueNum: 50,
          })
        ).rejects.toThrow();
      });
    });

    describe('deleteResults', () => {
      it('should delete a single indicator result', async () => {
        const { orgKey, userId, trpcClient } = context;

        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const insertResponse =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            TargetValueNum: 85,
          });

        expect(insertResponse.Id).toBeDefined();

        await expect(
          trpcClient.frontend.indicator.deleteResults.mutate({
            ids: [insertResponse.Id],
          })
        ).resolves.not.toThrow();
      });

      it('should delete multiple indicator results in a single call', async () => {
        const { orgKey, userId, trpcClient } = context;

        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const insertResponse1 =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-30T12:00:00.000Z',
            TargetValueNum: 80,
          });

        const insertResponse2 =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-02-01T12:00:00.000Z',
            TargetValueNum: 90,
          });

        expect(insertResponse1.Id).toBeDefined();
        expect(insertResponse2.Id).toBeDefined();

        await expect(
          trpcClient.frontend.indicator.deleteResults.mutate({
            ids: [insertResponse1.Id, insertResponse2.Id],
          })
        ).resolves.not.toThrow();
      });

      it('should reject an invalid UUID in the ids array', async () => {
        const { trpcClient } = context;

        await expect(
          trpcClient.frontend.indicator.deleteResults.mutate({
            ids: [
              'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
            ],
          })
        ).rejects.toThrow();
      });

      it('should reject an empty ids array', async () => {
        const { trpcClient } = context;

        const invalidInput = JSON.parse(
          JSON.stringify({ ids: [] })
        ) as Parameters<
          typeof trpcClient.frontend.indicator.deleteResults.mutate
        >[0];

        await expect(
          trpcClient.frontend.indicator.deleteResults.mutate(invalidInput)
        ).rejects.toThrow();
      });

      it('should return a 404 error when deleting a non-existent indicator result ID', async () => {
        const { trpcClient } = context;

        const nonExistentId = '00000000-0000-0000-0000-000000000001';

        await expect(
          trpcClient.frontend.indicator.deleteResults.mutate({
            ids: [nonExistentId],
          })
        ).rejects.toThrow();
      });
    });

    describe('updateResult', () => {
      it('should update an indicator result with required fields only', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Create a parent indicator
        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Create an indicator result via tRPC
        const insertResponse =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-15T10:00:00.000Z',
            TargetValueNum: 80,
          });

        expect(insertResponse.Id).toBeDefined();

        const updatedDate = '2026-02-01T10:00:00.000Z';

        const updateResponse =
          await trpcClient.frontend.indicator.updateResult.mutate({
            Id: insertResponse.Id,
            ResultDate: updatedDate,
            TargetValueNum: 80,
          });

        expect(updateResponse.Id).toBeDefined();

        // Read back and verify the update
        const results =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(results).toHaveLength(1);
        expect(results[0]?.Id).toBe(insertResponse.Id);
        expect(new Date(results[0]?.ResultDate ?? '').toISOString()).toBe(
          new Date(updatedDate).toISOString()
        );
      });

      it('should update all optional fields on an indicator result', async () => {
        const { orgKey, userId, trpcClient } = context;

        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const insertResponse =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-15T10:00:00.000Z',
            TargetValueNum: 70,
          });

        expect(insertResponse.Id).toBeDefined();

        const updatedDescription = 'Updated description';
        const updatedDate = '2026-03-01T09:00:00.000Z';
        const updatedCustomData = { source: 'automated', verified: false };

        const updateResponse =
          await trpcClient.frontend.indicator.updateResult.mutate({
            Id: insertResponse.Id,
            ResultDate: updatedDate,
            Description: updatedDescription,
            TargetValueNum: null,
            TargetValueTxt: 'On target',
            CustomAttributeData: updatedCustomData,
          });

        expect(updateResponse.Id).toBeDefined();

        const results =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(results).toHaveLength(1);
        expect(results[0]?.Id).toBe(insertResponse.Id);
        expect(results[0]?.Description).toBe(updatedDescription);
        expect(new Date(results[0]?.ResultDate ?? '').toISOString()).toBe(
          new Date(updatedDate).toISOString()
        );
        expect(results[0]?.TargetValueTxt).toBe('On target');
        expect(results[0]?.CustomAttributeData).toEqual(updatedCustomData);
      });

      it('should update optional fields to null', async () => {
        const { orgKey, userId, trpcClient } = context;

        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        // Insert with description and custom attribute data
        const insertResponse =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-15T10:00:00.000Z',
            Description: 'Initial description',
            TargetValueNum: 60,
            CustomAttributeData: { key: 'value' },
          });

        expect(insertResponse.Id).toBeDefined();

        // Update clearing optional fields
        const updateResponse =
          await trpcClient.frontend.indicator.updateResult.mutate({
            Id: insertResponse.Id,
            ResultDate: '2026-01-15T10:00:00.000Z',
            TargetValueNum: 60,
            Description: null,
            CustomAttributeData: null,
          });

        expect(updateResponse.Id).toBeDefined();

        const results =
          await trpcClient.frontend.indicator.indicatorResultsByIndicatorId.query(
            {
              indicatorId: insertedIndicator.Id,
            }
          );

        expect(results).toHaveLength(1);
        expect(results[0]?.Description).toBeNull();
        expect(results[0]?.CustomAttributeData).toBeNull();
      });

      it('should reject update with invalid UUID for Id', async () => {
        const { trpcClient } = context;

        await expect(
          trpcClient.frontend.indicator.updateResult.mutate({
            Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
            ResultDate: '2026-01-15T10:00:00.000Z',
            TargetValueNum: 80,
          })
        ).rejects.toThrow();
      });

      it('should reject update with missing required ResultDate field', async () => {
        const { orgKey, userId, trpcClient } = context;

        const indicatorInput = buildIndicator({ orgKey, userId });
        const insertedIndicator = await insertIndicator(indicatorInput);

        if (!insertedIndicator) {
          throw new Error('Failed to insert indicator');
        }

        const insertResponse =
          await trpcClient.frontend.indicator.insertResult.mutate({
            IndicatorId: insertedIndicator.Id,
            ResultDate: '2026-01-15T10:00:00.000Z',
            TargetValueNum: 75,
          });

        expect(insertResponse.Id).toBeDefined();

        const invalidInput = JSON.parse(
          JSON.stringify({ Id: insertResponse.Id, TargetValueNum: 75 })
        ) as Parameters<
          typeof trpcClient.frontend.indicator.updateResult.mutate
        >[0];

        await expect(
          trpcClient.frontend.indicator.updateResult.mutate(invalidInput)
        ).rejects.toThrow();
      });
    });
  });
});
