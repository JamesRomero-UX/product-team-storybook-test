import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';
import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import {
  buildAssessmentResultParent,
  buildDepartmentType,
  buildRisk,
  buildRiskAssessmentResult,
  buildTagType,
  buildUserGroup,
  insertAssessmentResultParent,
  insertDepartmentType,
  insertRisk,
  insertRiskAssessmentResult,
  insertTagType,
  insertUserGroup,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('risk', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('riskScoresByRiskId', () => {
    it('should return the risk with its tier', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.riskScoresByRiskId.query({
        riskId: insertedRisk.Id,
      });

      expect(response.risk.length).toEqual(1);
      expect(response.risk[0]).toEqual(
        expect.objectContaining({
          Id: insertedRisk.Id,
          Tier: riskInput.Tier,
        })
      );
      expect(response.inherent).toEqual([]);
      expect(response.residual).toEqual([]);
    });

    it('should return inherent (uncontrolled) assessment results for the risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create inherent (uncontrolled) risk assessment result
      const inherentResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
          Likelihood: 3,
          Impact: 4,
          Rating: 12,
        },
      });
      const insertedInherentResult =
        await insertRiskAssessmentResult(inherentResult);

      if (!insertedInherentResult) {
        throw new Error('Failed to insert inherent result');
      }

      // Link the assessment result to the risk via assessment_result_parent
      const assessmentResultParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: insertedRisk.Id,
        overrides: {
          Id: insertedInherentResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(assessmentResultParent);

      const response = await trpcClient.frontend.risk.riskScoresByRiskId.query({
        riskId: insertedRisk.Id,
      });

      expect(response.risk.length).toEqual(1);
      expect(response.inherent.length).toEqual(1);
      expect(response.inherent[0]).toEqual(
        expect.objectContaining({
          Id: insertedInherentResult.Id,
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
          Likelihood: inherentResult.Likelihood,
          Impact: inherentResult.Impact,
          Rating: inherentResult.Rating,
        })
      );
      expect(response.residual).toEqual([]);
    });

    it('should return residual (controlled) assessment results for the risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create residual (controlled) risk assessment result
      const residualResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          ControlType: RiskAssessmentResultControlType.Controlled,
          Likelihood: 2,
          Impact: 3,
          Rating: 6,
        },
      });
      const insertedResidualResult =
        await insertRiskAssessmentResult(residualResult);

      if (!insertedResidualResult) {
        throw new Error('Failed to insert residual result');
      }

      // Link the assessment result to the risk via assessment_result_parent
      const assessmentResultParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: insertedRisk.Id,
        overrides: {
          Id: insertedResidualResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(assessmentResultParent);

      const response = await trpcClient.frontend.risk.riskScoresByRiskId.query({
        riskId: insertedRisk.Id,
      });

      expect(response.risk.length).toEqual(1);
      expect(response.inherent).toEqual([]);
      expect(response.residual.length).toEqual(1);
      expect(response.residual[0]).toEqual(
        expect.objectContaining({
          Id: insertedResidualResult.Id,
          ControlType: RiskAssessmentResultControlType.Controlled,
          Likelihood: residualResult.Likelihood,
          Impact: residualResult.Impact,
          Rating: residualResult.Rating,
        })
      );
    });

    it('should return both inherent and residual assessment results for the risk', async () => {
      const { orgKey, userId, trpcClient } = context;

      const riskInput = buildRisk({
        orgKey,
        userId,
      });
      const insertedRisk = await insertRisk(riskInput);

      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // Create inherent (uncontrolled) risk assessment result
      const inherentResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
          Likelihood: 4,
          Impact: 5,
          Rating: 20,
        },
      });
      const insertedInherentResult =
        await insertRiskAssessmentResult(inherentResult);

      if (!insertedInherentResult) {
        throw new Error('Failed to insert inherent result');
      }

      // Create residual (controlled) risk assessment result
      const residualResult = buildRiskAssessmentResult({
        orgKey,
        userId,
        overrides: {
          ControlType: RiskAssessmentResultControlType.Controlled,
          Likelihood: 2,
          Impact: 3,
          Rating: 6,
        },
      });
      const insertedResidualResult =
        await insertRiskAssessmentResult(residualResult);

      if (!insertedResidualResult) {
        throw new Error('Failed to insert residual result');
      }

      // Link both assessment results to the risk
      const inherentParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: insertedRisk.Id,
        overrides: {
          Id: insertedInherentResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(inherentParent);

      const residualParent = buildAssessmentResultParent({
        orgKey,
        userId,
        parentId: insertedRisk.Id,
        overrides: {
          Id: insertedResidualResult.Id,
          ResultType: ParentTypes.RiskAssessmentResult,
          ParentType: ParentTypes.Risk,
        },
      });
      await insertAssessmentResultParent(residualParent);

      const response = await trpcClient.frontend.risk.riskScoresByRiskId.query({
        riskId: insertedRisk.Id,
      });

      expect(response.risk.length).toEqual(1);
      expect(response.inherent.length).toEqual(1);
      expect(response.residual.length).toEqual(1);

      expect(response.inherent[0]).toEqual(
        expect.objectContaining({
          Id: insertedInherentResult.Id,
          ControlType: RiskAssessmentResultControlType.Uncontrolled,
          Likelihood: inherentResult.Likelihood,
          Impact: inherentResult.Impact,
          Rating: inherentResult.Rating,
        })
      );

      expect(response.residual[0]).toEqual(
        expect.objectContaining({
          Id: insertedResidualResult.Id,
          ControlType: RiskAssessmentResultControlType.Controlled,
          Likelihood: residualResult.Likelihood,
          Impact: residualResult.Impact,
          Rating: residualResult.Rating,
        })
      );
    });

    it('should return empty arrays when risk does not exist', async () => {
      const { trpcClient } = context;

      const nonExistentRiskId = '00000000-0000-0000-0000-000000000000';

      const response = await trpcClient.frontend.risk.riskScoresByRiskId.query({
        riskId: nonExistentRiskId,
      });

      expect(response.risk).toEqual([]);
      expect(response.inherent).toEqual([]);
      expect(response.residual).toEqual([]);
    });
  });

  describe('insert', () => {
    it('should insert a Tier 1 risk without a parent', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Top-level Risk',
        Tier: 1,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a Tier 2 risk with a valid parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Child Risk',
        Tier: 2,
        ParentRiskId: parentRisk.Id,
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a risk with all optional fields', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Full Risk',
        Tier: 1,
        Description: 'A detailed description',
        Treatment: RiskTreatmentType.Treat,
        Status: RiskStatusType.Active,
        CustomAttributeData: { customField: 'value' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a risk with null CustomAttributeData', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with null custom data',
        Tier: 1,
        CustomAttributeData: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject Tier 2 insert without ParentRiskId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.risk.insert.mutate({
          Title: 'Orphan Child Risk',
          Tier: 2,
        })
      ).rejects.toThrow();
    });

    it('should reject insert with an empty title', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.risk.insert.mutate({
          Title: '',
          Tier: 1,
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with Owner',
        Tier: 1,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.owners).toHaveLength(1);
      expect(risks[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with Contributor',
        Tier: 1,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.contributors).toHaveLength(1);
      expect(risks[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist multiple owners and contributors', async () => {
      const { userId, trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with Owners and Contributors',
        Tier: 1,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.owners).toHaveLength(1);
      expect(risks[0]?.contributors).toHaveLength(1);
    });

    it('should insert a risk with empty relationship arrays', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with no relationships',
        Tier: 1,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks[0]?.owners).toHaveLength(0);
      expect(risks[0]?.contributors).toHaveLength(0);
    });

    it('should persist tags and departments when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Risk Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Risk Department' })
      );

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with tags and departments',
        Tier: 1,
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.tags).toHaveLength(1);
      expect(risks[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
      expect(risks[0]?.departments).toHaveLength(1);
      expect(risks[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should create schedule_state with DueDate equal to StartDate for non-adhoc schedule', async () => {
      const { trpcClient } = context;

      const startDate = '2026-03-01T00:00:00.000Z';

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with schedule',
        Tier: 1,
        Schedule: {
          Frequency: TestFrequency.Monthly,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      const scheduleState = risks[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(startDate);
      expect(scheduleState!.OverdueDate).toBeNull();
      expect(scheduleState!.LatestDate).toBeNull();
    });

    it('should create schedule_state with ManualDueDate for adhoc schedule', async () => {
      const { trpcClient } = context;

      const manualDueDate = '2026-06-15T00:00:00.000Z';

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with adhoc schedule',
        Tier: 1,
        Schedule: {
          Frequency: TestFrequency.Adhoc,
          StartDate: null,
          ManualDueDate: manualDueDate,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      const scheduleState = risks[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
        manualDueDate
      );
      expect(scheduleState!.LatestDate).toBeNull();
    });

    it('should calculate OverdueDate from DueDate and TimeToComplete', async () => {
      const { trpcClient } = context;

      const startDate = '2026-03-01T00:00:00.000Z';

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk with overdue',
        Tier: 1,
        Schedule: {
          Frequency: TestFrequency.Weekly,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: 5,
          TimeToCompleteUnit: UnitOfTime.Day,
        },
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      const scheduleState = risks[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(startDate);
      expect(new Date(scheduleState!.OverdueDate!).toISOString()).toBe(
        '2026-03-06T00:00:00.000Z'
      );
    });

    it('should not create schedule_state when no Schedule is provided', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk without schedule',
        Tier: 1,
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.scheduleState).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a risk with required fields only', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Updated Risk Title',
        Tier: 1,
      });

      expect(response.Id).toBeDefined();
      expect(typeof response.Id).toBe('string');
    });

    it('should update a risk with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Fully Updated Risk',
        Tier: 1,
        Description: 'Updated description',
        Treatment: RiskTreatmentType.Treat,
        Status: RiskStatusType.Active,
        CustomAttributeData: { customField: 'updatedValue' },
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.Title).toBe('Fully Updated Risk');
      expect(risks[0]?.Description).toBe('Updated description');
      expect(risks[0]?.Treatment).toBe(RiskTreatmentType.Treat);
      expect(risks[0]?.Status).toBe(RiskStatusType.Active);
    });

    it('should accept null for optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with null optionals',
        Tier: 1,
        Description: null,
        Treatment: null,
        Status: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject update with an empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      await expect(
        trpcClient.frontend.risk.update.mutate({
          Id: insertedRisk.Id,
          Title: '',
          Tier: 1,
        })
      ).rejects.toThrow();
    });

    it('should reject update with an invalid UUID for Id', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.risk.update.mutate({
          Id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
          Title: 'Some Title',
          Tier: 1,
        })
      ).rejects.toThrow();
    });

    it('should reject Tier 2 update without ParentRiskId', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      await expect(
        trpcClient.frontend.risk.update.mutate({
          Id: insertedRisk.Id,
          Title: 'Tier 2 without parent',
          Tier: 2,
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Owner',
        Tier: 1,
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.owners).toHaveLength(1);
      expect(risks[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist owner group when OwnerGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const userGroup = await insertUserGroup(
        buildUserGroup({ orgKey, userId, overrides: { Name: 'Owner Group' } })
      );
      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Owner Group',
        Tier: 1,
        OwnerGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.ownerGroups).toHaveLength(1);
      expect(risks[0]?.ownerGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Contributor',
        Tier: 1,
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.contributors).toHaveLength(1);
      expect(risks[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist contributor group when ContributorGroupIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const userGroup = await insertUserGroup(
        buildUserGroup({
          orgKey,
          userId,
          overrides: { Name: 'Contributor Group' },
        })
      );
      if (!userGroup) {
        throw new Error('Failed to insert user group');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Contributor Group',
        Tier: 1,
        ContributorGroupIds: [userGroup.Id],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.contributorGroups).toHaveLength(1);
      expect(risks[0]?.contributorGroups[0]?.UserGroupId).toBe(userGroup.Id);
    });

    it('should persist tag when TagTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Update Tag' })
      );
      if (!tagType) {
        throw new Error('Failed to insert tag type');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Tag',
        Tier: 1,
        TagTypeIds: [tagType.TagTypeId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.tags).toHaveLength(1);
      expect(risks[0]?.tags[0]?.TagTypeId).toBe(tagType.TagTypeId);
    });

    it('should persist department when DepartmentTypeIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Update Department' })
      );
      if (!departmentType) {
        throw new Error('Failed to insert department type');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Department',
        Tier: 1,
        DepartmentTypeIds: [departmentType.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.departments).toHaveLength(1);
      expect(risks[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType.DepartmentTypeId
      );
    });

    it('should persist multiple owners and contributors together', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with Owners and Contributors',
        Tier: 1,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.owners).toHaveLength(1);
      expect(risks[0]?.contributors).toHaveLength(1);
    });

    it('should clear all relationships when empty arrays are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const insertedRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!insertedRisk) {
        throw new Error('Failed to insert risk');
      }

      // First update with relationships
      await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk before clearing',
        Tier: 1,
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      // Then update with empty arrays to clear relationships
      const response = await trpcClient.frontend.risk.update.mutate({
        Id: insertedRisk.Id,
        Title: 'Risk with no relationships',
        Tier: 1,
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const risks = await trpcClient.frontend.risk.riskById.query({
        riskId: response.Id,
      });
      expect(risks).toHaveLength(1);
      expect(risks[0]?.owners).toHaveLength(0);
      expect(risks[0]?.ownerGroups).toHaveLength(0);
      expect(risks[0]?.contributors).toHaveLength(0);
      expect(risks[0]?.contributorGroups).toHaveLength(0);
      expect(risks[0]?.tags).toHaveLength(0);
      expect(risks[0]?.departments).toHaveLength(0);
    });

    describe('schedule state refresh', () => {
      // Override context to exclude 'impacts' feature flag so the rating-based
      // refresh path is used (which looks up risk assessment results, not impact ratings)
      const featureFlagsWithoutImpacts =
        'notifications,reports,compliance,policy,notification-preferences,approvers,attestations,internal_audit,compliance_monitoring,multi_reporting,enterprise_risk,permit,aie_chat,modules,trpc,mcp';

      beforeEach(async () => {
        context = await createTestContext({
          hasura_feature_flags: featureFlagsWithoutImpacts,
        });
        contexts.push(context);
      });

      const monthlySchedule = {
        Frequency: TestFrequency.Monthly,
        StartDate: '2026-01-01T00:00:00.000Z',
        ManualDueDate: null,
        TimeToCompleteValue: null,
        TimeToCompleteUnit: null,
      };

      const insertAssessmentForRisk = async (params: {
        orgKey: string;
        userId: string;
        riskId: string;
        testDate: string;
      }) => {
        const { orgKey, userId, riskId, testDate } = params;
        const result = buildRiskAssessmentResult({
          orgKey,
          userId,
          overrides: {
            ControlType: RiskAssessmentResultControlType.Uncontrolled,
            Likelihood: 3,
            Impact: 4,
            Rating: 12,
            TestDate: testDate,
          },
        });
        const inserted = await insertRiskAssessmentResult(result);
        if (!inserted) {
          throw new Error('Failed to insert risk assessment result');
        }
        await insertAssessmentResultParent(
          buildAssessmentResultParent({
            orgKey,
            userId,
            parentId: riskId,
            overrides: {
              Id: inserted.Id,
              ResultType: ParentTypes.RiskAssessmentResult,
              ParentType: ParentTypes.Risk,
            },
          })
        );

        return inserted;
      };

      it('should leave schedule state null when updating without a schedule and no results', async () => {
        const { trpcClient } = context;

        // Insert risk without schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk no schedule',
          Tier: 1,
        });

        // Update without adding a schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk no schedule updated',
          Tier: 1,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        expect(risks[0]?.scheduleState).toBeNull();
      });

      it('should leave schedule state null when updating without a schedule and results exist', async () => {
        const { orgKey, userId, trpcClient } = context;

        // Insert risk without schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk no schedule with result',
          Tier: 1,
        });

        // Add an assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: '2026-02-15T00:00:00.000Z',
        });

        // Update without adding a schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk no schedule with result updated',
          Tier: 1,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        expect(risks[0]?.scheduleState).toBeNull();
      });

      it('should create schedule state when adding a new schedule on update with no results', async () => {
        const { trpcClient } = context;

        // Insert risk without schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk adding schedule',
          Tier: 1,
        });

        // Verify no schedule state initially
        const risksBefore = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risksBefore[0]?.scheduleState).toBeNull();

        // Update to add a schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk adding schedule updated',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          monthlySchedule.StartDate
        );
        expect(scheduleState!.LatestDate).toBeNull();
        expect(scheduleState!.OverdueDate).toBeNull();
      });

      it('should create schedule state with advanced DueDate when adding a new schedule on update with results', async () => {
        const { orgKey, userId, trpcClient } = context;

        const assessmentTestDate = '2026-02-15T00:00:00.000Z';

        // Insert risk without schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk adding schedule with result',
          Tier: 1,
        });

        // Add an assessment result before the schedule exists
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: assessmentTestDate,
        });

        // Update to add a schedule — refresh should pick up the existing result
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk adding schedule with result updated',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        // Monthly from 2026-01-01, latest 2026-02-15 → next due 2026-03-01
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          '2026-03-01T00:00:00.000Z'
        );
        expect(new Date(scheduleState!.LatestDate!).toISOString()).toBe(
          assessmentTestDate
        );
      });

      it('should refresh schedule state when schedule already existed and no results', async () => {
        const { trpcClient } = context;

        // Insert risk with schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk existing schedule',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Update the risk (schedule already exists, no results)
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk existing schedule updated',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          monthlySchedule.StartDate
        );
        expect(scheduleState!.LatestDate).toBeNull();
        expect(scheduleState!.OverdueDate).toBeNull();
      });

      it('should refresh schedule state with advanced DueDate when schedule already existed and results exist', async () => {
        const { orgKey, userId, trpcClient } = context;

        const assessmentTestDate = '2026-02-15T00:00:00.000Z';

        // Insert risk with schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk existing schedule with result',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Add an assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: assessmentTestDate,
        });

        // Update the risk to trigger schedule refresh
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk existing schedule with result updated',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        // Monthly from 2026-01-01, latest 2026-02-15 → next due 2026-03-01
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          '2026-03-01T00:00:00.000Z'
        );
        expect(new Date(scheduleState!.LatestDate!).toISOString()).toBe(
          assessmentTestDate
        );
      });

      it('should recalculate DueDate when schedule frequency changes on update', async () => {
        const { orgKey, userId, trpcClient } = context;

        const startDate = '2026-01-01T00:00:00.000Z';
        const assessmentTestDate = '2026-01-10T00:00:00.000Z';

        // Insert risk with monthly schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk frequency change',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Add an assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: assessmentTestDate,
        });

        // Verify monthly DueDate first
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk frequency change - monthly',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risksMonthly = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        // Monthly from 2026-01-01, latest 2026-01-10 → next due 2026-02-01
        const monthlyState = risksMonthly[0]?.scheduleState;
        expect(monthlyState).toBeDefined();
        expect(new Date(monthlyState!.DueDate!).toISOString()).toBe(
          '2026-02-01T00:00:00.000Z'
        );

        // Now change to weekly schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk frequency change - weekly',
          Tier: 1,
          Schedule: {
            Frequency: TestFrequency.Weekly,
            StartDate: startDate,
            ManualDueDate: null,
            TimeToCompleteValue: null,
            TimeToCompleteUnit: null,
          },
        });

        const risksWeekly = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        const scheduleState = risksWeekly[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        // Weekly from 2026-01-01 (Thursday), latest 2026-01-10 (Saturday)
        // Aligns to Thursday of the week containing 2026-01-10 → 2026-01-08
        // 2026-01-08 < 2026-01-10 so adds one week → 2026-01-15
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          '2026-01-15T00:00:00.000Z'
        );
        expect(new Date(scheduleState!.LatestDate!).toISOString()).toBe(
          assessmentTestDate
        );
      });

      it('should use ManualDueDate when switching to adhoc schedule on update', async () => {
        const { trpcClient } = context;

        const manualDueDate = '2026-06-15T00:00:00.000Z';

        // Insert risk with monthly schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk switching to adhoc',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Update to adhoc schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk now adhoc',
          Tier: 1,
          Schedule: {
            Frequency: TestFrequency.Adhoc,
            StartDate: null,
            ManualDueDate: manualDueDate,
            TimeToCompleteValue: null,
            TimeToCompleteUnit: null,
          },
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          manualDueDate
        );
        expect(scheduleState!.LatestDate).toBeNull();
      });

      it('should not clear schedule state when updating without a Schedule field after one existed', async () => {
        const { trpcClient } = context;

        // Insert risk with schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk removing schedule',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Verify schedule state was created
        const risksBefore = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        const stateBefore = risksBefore[0]?.scheduleState;
        expect(stateBefore).toBeDefined();
        expect(new Date(stateBefore!.DueDate!).toISOString()).toBe(
          monthlySchedule.StartDate
        );

        // Update without passing Schedule
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk schedule removed',
          Tier: 1,
        });

        const risksAfter = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risksAfter).toHaveLength(1);
        // Schedule state persists — refresh reads the schedule from DB,
        // so state remains based on whatever schedule config is stored
        const scheduleState = risksAfter[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          monthlySchedule.StartDate
        );
      });

      it('should advance OverdueDate along with DueDate when results exist and TimeToComplete is set', async () => {
        const { orgKey, userId, trpcClient } = context;

        const startDate = '2026-01-01T00:00:00.000Z';
        const assessmentTestDate = '2026-02-15T00:00:00.000Z';

        // Insert risk with monthly schedule + time to complete
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk overdue with result',
          Tier: 1,
          Schedule: {
            Frequency: TestFrequency.Monthly,
            StartDate: startDate,
            ManualDueDate: null,
            TimeToCompleteValue: 5,
            TimeToCompleteUnit: UnitOfTime.Day,
          },
        });

        // Add an assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: assessmentTestDate,
        });

        // Update to trigger refresh
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk overdue with result updated',
          Tier: 1,
          Schedule: {
            Frequency: TestFrequency.Monthly,
            StartDate: startDate,
            ManualDueDate: null,
            TimeToCompleteValue: 5,
            TimeToCompleteUnit: UnitOfTime.Day,
          },
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        // Monthly from 2026-01-01, latest 2026-02-15 → next due 2026-03-01
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          '2026-03-01T00:00:00.000Z'
        );
        // OverdueDate = 2026-03-01 + 5 days = 2026-03-06
        expect(new Date(scheduleState!.OverdueDate!).toISOString()).toBe(
          '2026-03-06T00:00:00.000Z'
        );
        expect(new Date(scheduleState!.LatestDate!).toISOString()).toBe(
          assessmentTestDate
        );
      });

      it('should use the latest assessment result when multiple results exist', async () => {
        const { orgKey, userId, trpcClient } = context;

        const olderTestDate = '2026-01-15T00:00:00.000Z';
        const newerTestDate = '2026-03-20T00:00:00.000Z';

        // Insert risk with monthly schedule
        const insertResponse = await trpcClient.frontend.risk.insert.mutate({
          Title: 'Risk multiple results',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        // Insert older assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: olderTestDate,
        });

        // Insert newer assessment result
        await insertAssessmentForRisk({
          orgKey,
          userId,
          riskId: insertResponse.Id,
          testDate: newerTestDate,
        });

        // Update to trigger refresh
        await trpcClient.frontend.risk.update.mutate({
          Id: insertResponse.Id,
          Title: 'Risk multiple results updated',
          Tier: 1,
          Schedule: monthlySchedule,
        });

        const risks = await trpcClient.frontend.risk.riskById.query({
          riskId: insertResponse.Id,
        });
        expect(risks).toHaveLength(1);
        const scheduleState = risks[0]?.scheduleState;
        expect(scheduleState).toBeDefined();
        // Should use newerTestDate (2026-03-20), not olderTestDate
        // Monthly from 2026-01-01, latest 2026-03-20 → next due 2026-04-01
        expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
          '2026-04-01T00:00:00.000Z'
        );
        expect(new Date(scheduleState!.LatestDate!).toISOString()).toBe(
          newerTestDate
        );
      });
    });
  });

  describe('delete', () => {
    it('should delete an existing risk', async () => {
      const { trpcClient } = context;

      const insertResponse = await trpcClient.frontend.risk.insert.mutate({
        Title: 'Risk to delete',
        Tier: 1,
      });

      expect(insertResponse.Id).toBeDefined();

      await expect(
        trpcClient.frontend.risk.delete.mutate({ id: insertResponse.Id })
      ).resolves.not.toThrow();
    });

    it('should throw when deleting a non-existent risk', async () => {
      const { trpcClient } = context;

      const nonExistentId = '00000000-0000-0000-0000-000000000001';

      await expect(
        trpcClient.frontend.risk.delete.mutate({ id: nonExistentId })
      ).rejects.toThrow();
    });

    it('should throw when deleting with an invalid UUID', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.risk.delete.mutate({
          id: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`,
        })
      ).rejects.toThrow();
    });
  });
});
