import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import {
  buildAssessment,
  buildControl,
  buildTestResult,
  insertAssessment,
  insertControl,
  insertTestResult,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('test-result', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('insert', () => {
    it('should insert a test result with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const response = await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control.Id],
      });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
    });

    it('should insert a test result with all optional fields populated', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const response = await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control.Id],
        Description: 'A detailed test result description',
        DesignEffectiveness: 3,
        OverallEffectiveness: 2,
        PerformanceEffectiveness: 4,
        Submitter: userId,
        TestDate: '2026-01-15T10:00:00.000Z',
        TestType: TestType.BusinessLine,
        Title: 'Full Test Result',
        CustomAttributeData: { customField: 'value' },
      });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
    });

    it('should insert test results for multiple controls', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control1 = await insertControl(buildControl(orgKey, userId));
      const control2 = await insertControl(buildControl(orgKey, userId));
      if (!control1 || !control2) {
        throw new Error('Failed to insert controls');
      }

      const response = await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control1.Id, control2.Id],
      });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(2);
    });

    it('should insert a test result with an AssessmentId', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const assessment = await insertAssessment(
        buildAssessment(orgKey, userId)
      );
      if (!assessment) {
        throw new Error('Failed to insert assessment');
      }

      const response = await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control.Id],
        AssessmentId: assessment.Id,
      });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
    });

    it('should insert a test result with explicit null for all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const response = await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control.Id],
        AssessmentId: null,
        Description: null,
        DesignEffectiveness: null,
        OverallEffectiveness: null,
        PerformanceEffectiveness: null,
        Submitter: null,
        TestDate: null,
        TestType: null,
        Title: null,
        CustomAttributeData: null,
      });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
    });

    it('should reject insert with empty ControlIds array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ControlIds: [] })
      ) as Parameters<typeof trpcClient.frontend.testResult.insert.mutate>[0];

      await expect(
        trpcClient.frontend.testResult.insert.mutate(invalidInput)
      ).rejects.toThrow();
    });

    it('should reject insert with an invalid UUID in ControlIds', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ControlIds: ['not-a-uuid'] })
      ) as Parameters<typeof trpcClient.frontend.testResult.insert.mutate>[0];

      await expect(
        trpcClient.frontend.testResult.insert.mutate(invalidInput)
      ).rejects.toThrow();
    });

    it('should update control schedule state LatestDate and DueDate after insert', async () => {
      const { trpcClient } = context;

      // Use today as the start date so the schedule is always current
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const startDate = today.toISOString();

      // TestDate is today — one daily cycle later the DueDate should advance by one day
      const testDate = startDate;
      const expectedNextDueDate = new Date(today);
      expectedNextDueDate.setUTCDate(expectedNextDueDate.getUTCDate() + 1);
      const expectedDueDate = expectedNextDueDate.toISOString();

      // Create control with a daily schedule via tRPC (sets up schedule + initial state)
      const control = await trpcClient.frontend.control.insert.mutate({
        Title: 'Control with schedule for test result',
        Schedule: {
          Frequency: TestFrequency.Daily,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      // Verify initial schedule state: DueDate = StartDate, LatestDate = null
      const controlsBefore =
        await trpcClient.frontend.control.controlById.query({
          controlId: control.Id,
        });
      expect(controlsBefore).toHaveLength(1);
      const stateBefore = controlsBefore[0]?.scheduleState;
      expect(stateBefore, 'initial schedule state should exist').not.toBeNull();
      expect(
        stateBefore!.DueDate,
        'initial DueDate should be set'
      ).not.toBeNull();
      expect(new Date(stateBefore!.DueDate!).toISOString()).toBe(startDate);
      expect(stateBefore!.LatestDate).toBeNull();

      // Insert test result with TestDate = today
      await trpcClient.frontend.testResult.insert.mutate({
        ControlIds: [control.Id],
        TestDate: testDate,
      });

      // Verify schedule state was refreshed after test result insert
      const controlsAfter = await trpcClient.frontend.control.controlById.query(
        {
          controlId: control.Id,
        }
      );
      expect(controlsAfter).toHaveLength(1);
      const stateAfter = controlsAfter[0]?.scheduleState;
      expect(stateAfter, 'schedule state should still exist').not.toBeNull();
      expect(
        stateAfter!.LatestDate,
        'LatestDate should be updated by schedule refresh'
      ).not.toBeNull();
      expect(new Date(stateAfter!.LatestDate!).toISOString()).toBe(testDate);
      expect(
        stateAfter!.DueDate,
        'DueDate should advance after refresh'
      ).not.toBeNull();
      // DueDate should advance by one day (daily frequency)
      expect(new Date(stateAfter!.DueDate!).toISOString()).toBe(
        expectedDueDate
      );
    });
  });

  describe('update', () => {
    it('should update a test result with all fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const testResult = await insertTestResult(
        buildTestResult({ orgKey, userId, ParentControlId: control.Id })
      );
      if (!testResult) {
        throw new Error('Failed to insert test result');
      }

      const response = await trpcClient.frontend.testResult.update.mutate({
        Id: testResult.Id,
        ParentControlId: control.Id,
        Title: 'Updated Test Result Title',
        Description: 'Updated description',
        DesignEffectiveness: 4,
        OverallEffectiveness: 3,
        PerformanceEffectiveness: 2,
        Submitter: userId,
        TestDate: '2026-02-01T00:00:00.000Z',
        TestType: TestType.BusinessLine,
        CustomAttributeData: { updatedField: 'value' },
        OriginalTimestamp: new Date(
          testResult.ModifiedAtTimestamp
        ).toISOString(),
      });

      expect(response.Id).toBeDefined();
      expect(response.Id).toBe(testResult.Id);

      const results = await trpcClient.frontend.testResult.testResultById.query(
        { testResultId: testResult.Id }
      );
      expect(results).toHaveLength(1);
      expect(results[0]?.Title).toBe('Updated Test Result Title');
      expect(results[0]?.Description).toBe('Updated description');
      expect(results[0]?.DesignEffectiveness).toBe(4);
      expect(results[0]?.OverallEffectiveness).toBe(3);
      expect(results[0]?.PerformanceEffectiveness).toBe(2);
      expect(results[0]?.TestType).toBe(TestType.BusinessLine);
    });

    it('should reject update with a stale OriginalTimestamp (optimistic concurrency)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const testResult = await insertTestResult(
        buildTestResult({ orgKey, userId, ParentControlId: control.Id })
      );
      if (!testResult) {
        throw new Error('Failed to insert test result');
      }

      // Perform a first update so the record's timestamp advances
      await trpcClient.frontend.testResult.update.mutate({
        Id: testResult.Id,
        ParentControlId: control.Id,
        Title: 'First Update',
        OriginalTimestamp: new Date(
          testResult.ModifiedAtTimestamp
        ).toISOString(),
      });

      // Attempt a second update using the original (now stale) timestamp
      await expect(
        trpcClient.frontend.testResult.update.mutate({
          Id: testResult.Id,
          ParentControlId: control.Id,
          Title: 'Stale Update',
          OriginalTimestamp: new Date(
            testResult.ModifiedAtTimestamp
          ).toISOString(),
        })
      ).rejects.toThrow();
    });

    it('should reject update with an invalid UUID for Id', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      await expect(
        trpcClient.frontend.testResult.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          ParentControlId: control.Id,
          Title: 'Some Title',
          OriginalTimestamp: '2024-01-15T10:00:00Z',
        })
      ).rejects.toThrow();
    });

    it('should reject update with an invalid UUID for ParentControlId', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const testResult = await insertTestResult(
        buildTestResult({ orgKey, userId, ParentControlId: control.Id })
      );
      if (!testResult) {
        throw new Error('Failed to insert test result');
      }

      await expect(
        trpcClient.frontend.testResult.update.mutate({
          Id: testResult.Id,
          ParentControlId:
            'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Some Title',
          OriginalTimestamp: new Date(
            testResult.ModifiedAtTimestamp
          ).toISOString(),
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a single test result', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const testResult = await insertTestResult(
        buildTestResult({ orgKey, userId, ParentControlId: control.Id })
      );
      if (!testResult) {
        throw new Error('Failed to insert test result');
      }

      const response = await trpcClient.frontend.testResult.delete.mutate({
        ids: [testResult.Id],
      });

      expect(response).toBe('');
    });

    it('should delete multiple test results in a batch', async () => {
      const { orgKey, userId, trpcClient } = context;

      const control = await insertControl(buildControl(orgKey, userId));
      if (!control) {
        throw new Error('Failed to insert control');
      }

      const testResult1 = await insertTestResult(
        buildTestResult({
          orgKey,
          userId,
          ParentControlId: control.Id,
          overrides: { Title: 'Test Result 1' },
        })
      );
      const testResult2 = await insertTestResult(
        buildTestResult({
          orgKey,
          userId,
          ParentControlId: control.Id,
          overrides: { Title: 'Test Result 2' },
        })
      );
      if (!testResult1 || !testResult2) {
        throw new Error('Failed to insert test results');
      }

      const response = await trpcClient.frontend.testResult.delete.mutate({
        ids: [testResult1.Id, testResult2.Id],
      });

      expect(response).toBe('');
    });

    it('should reject delete with an empty ids array', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ids: [] })
      ) as Parameters<typeof trpcClient.frontend.testResult.delete.mutate>[0];

      await expect(
        trpcClient.frontend.testResult.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });

    it('should reject delete with invalid UUID in ids', async () => {
      const { trpcClient } = context;

      const invalidInput = JSON.parse(
        JSON.stringify({ ids: ['not-a-uuid'] })
      ) as Parameters<typeof trpcClient.frontend.testResult.delete.mutate>[0];

      await expect(
        trpcClient.frontend.testResult.delete.mutate(invalidInput)
      ).rejects.toThrow();
    });
  });
});
