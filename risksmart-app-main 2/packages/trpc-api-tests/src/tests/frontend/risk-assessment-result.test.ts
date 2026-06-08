import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import {
  buildRisk,
  buildRiskAssessmentResultConfig,
  insertRisk,
  insertRiskAssessmentResultConfig,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('riskAssessmentResult', () => {
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
    it('should insert with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk) {
        throw new Error('Failed to insert risk');
      }

      const response =
        await trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: [risk.Id],
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
        });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
      expect(typeof response.Ids[0]).toBe('string');
    });

    it('should insert with all optional fields populated', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk) {
        throw new Error('Failed to insert risk');
      }

      const testDate = '2026-02-24T00:00:00.000Z';

      const response =
        await trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: [risk.Id],
          ControlType: RiskAssessmentResultControlType.Controlled,
          Rating: 12,
          Likelihood: 3,
          Impact: 4,
          AssessmentId: null,
          CustomAttributeData: { customField: 'value' },
          TestDate: testDate,
          Rationale: 'Test rationale text',
        });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
      expect(typeof response.Ids[0]).toBe('string');
    });

    it('should insert with multiple RiskIds and return the correct number of Ids', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk1 = await insertRisk(buildRisk({ orgKey, userId }));
      const risk2 = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk1 || !risk2) {
        throw new Error('Failed to insert risks');
      }

      const response =
        await trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: [risk1.Id, risk2.Id],
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
        });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(2);
      expect(response.Ids[0]).not.toBe(response.Ids[1]);
    });

    it('should insert with null optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk) {
        throw new Error('Failed to insert risk');
      }

      const response =
        await trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: [risk.Id],
          ControlType: RiskAssessmentResultControlType.Controlled,
          Rating: null,
          Likelihood: null,
          Impact: null,
          AssessmentId: null,
          CustomAttributeData: null,
          TestDate: null,
          Rationale: null,
        });

      expect(response.Ids).toBeDefined();
      expect(response.Ids).toHaveLength(1);
    });

    it('should stamp ConfigId from latest config when config exists', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Insert 3 config rows so the DB trigger assigns versions 1, 2, 3
      // (the BEFORE INSERT trigger auto-assigns Version = MAX(existing) + 1)
      await insertRiskAssessmentResultConfig(
        buildRiskAssessmentResultConfig({ orgKey, userId })
      );
      await insertRiskAssessmentResultConfig(
        buildRiskAssessmentResultConfig({ orgKey, userId })
      );
      const latestConfig = await insertRiskAssessmentResultConfig(
        buildRiskAssessmentResultConfig({ orgKey, userId })
      );

      const risk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk) {
        throw new Error('Failed to insert risk');
      }

      await trpcClient.frontend.riskAssessmentResult.insert.mutate({
        RiskIds: [risk.Id],
        ControlType: RiskAssessmentResultControlType.Uncontrolled,
      });

      const results =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId: risk.Id }
        );

      expect(results).toHaveLength(1);
      expect(results[0]?.ConfigId).toBe(latestConfig?.Id);
    });

    it('should set ConfigId to null when no config exists', async () => {
      const { orgKey, userId, trpcClient } = context;

      const risk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!risk) {
        throw new Error('Failed to insert risk');
      }

      await trpcClient.frontend.riskAssessmentResult.insert.mutate({
        RiskIds: [risk.Id],
        ControlType: RiskAssessmentResultControlType.Uncontrolled,
      });

      const results =
        await trpcClient.frontend.assessment.riskAssessmentResultsByRiskId.query(
          { riskId: risk.Id }
        );

      expect(results).toHaveLength(1);
      expect(results[0]?.ConfigId).toBeNull();
    });

    it('should reject an empty RiskIds array', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: [],
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
        })
      ).rejects.toThrow();
    });

    it('should reject an invalid UUID in RiskIds', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.riskAssessmentResult.insert.mutate({
          RiskIds: ['not-a-valid-uuid'],
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
        })
      ).rejects.toThrow();
    });

    it('should update schedule state LatestDate and DueDate after insert', async () => {
      // Create a context WITHOUT the 'impacts' feature flag so the schedule
      // refresh uses the rating path (getLatestRiskAssessmentResult) rather
      // than the impact path (getOldestActiveImpactTestDate).
      const noImpactsContext = await createTestContext({
        hasura_feature_flags: [
          'notifications',
          'reports',
          'compliance',
          'policy',
          'notification-preferences',
          'approvers',
          'attestations',
          'internal_audit',
          'compliance_monitoring',
          'multi_reporting',
          'enterprise_risk',
          'permit',
          'aie_chat',
          'modules',
          'trpc',
        ].join(','),
      });
      contexts.push(noImpactsContext);
      const { trpcClient } = noImpactsContext;

      // Use today as the start date so the schedule is always current
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const startDate = today.toISOString();

      // TestDate is today — one daily cycle later the DueDate should advance by one day
      const testDate = startDate;
      const expectedNextDueDate = new Date(today);
      expectedNextDueDate.setUTCDate(expectedNextDueDate.getUTCDate() + 1);
      const expectedDueDate = expectedNextDueDate.toISOString();

      // Create risk with a daily schedule via tRPC (sets up schedule + initial state)
      const risk = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with schedule for assessment',
        Tier: 1,
        Schedule: {
          Frequency: TestFrequency.Daily,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      // Verify initial schedule state: DueDate = StartDate, LatestDate = null
      const risksBefore = await trpcClient.frontend.risk.riskById.query({
        riskId: risk.Id,
      });
      expect(risksBefore).toHaveLength(1);
      const stateBefore = risksBefore[0]?.scheduleState;
      expect(stateBefore, 'initial schedule state should exist').not.toBeNull();
      expect(
        stateBefore!.DueDate,
        'initial DueDate should be set'
      ).not.toBeNull();
      expect(new Date(stateBefore!.DueDate!).toISOString()).toBe(startDate);
      expect(stateBefore!.LatestDate).toBeNull();

      // Insert risk assessment result with TestDate = today
      await trpcClient.frontend.riskAssessmentResult.insert.mutate({
        RiskIds: [risk.Id],
        ControlType: RiskAssessmentResultControlType.Uncontrolled,
        TestDate: testDate,
      });

      // Verify schedule state was refreshed after assessment insert
      const risksAfter = await trpcClient.frontend.risk.riskById.query({
        riskId: risk.Id,
      });
      expect(risksAfter).toHaveLength(1);
      const stateAfter = risksAfter[0]?.scheduleState;
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
});
