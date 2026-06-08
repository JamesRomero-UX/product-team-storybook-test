import { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import {
  buildDepartmentType,
  buildRisk,
  buildTagType,
  insertDepartmentType,
  insertRisk,
  insertTagType,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('control', () => {
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
    it('should insert a top-level control without a parent', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.control.insert.mutate({
        Title: 'Top-level Control',
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a top-level control with null ParentId', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: null,
        Title: 'Another Top-level Control',
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a child control with a parent', async () => {
      const { orgKey, userId, trpcClient } = context;

      // Create a parent risk to attach the control to
      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Child Control',
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a control with all optional fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Full Control',
        Description: 'A detailed description of the control',
        Type: ControlType.Preventive,
        CustomAttributeData: { severity: 'high' },
      });

      expect(response.Id).toBeDefined();
    });

    it('should insert a control with null optional fields (form defaults)', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with nulls',
        Description: null,
        Type: null,
        CustomAttributeData: null,
        Schedule: null,
      });

      expect(response.Id).toBeDefined();
    });

    it('should reject insert with empty title', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      await expect(
        trpcClient.frontend.control.insert.mutate({
          ParentId: parentRisk.Id,
          Title: '',
        })
      ).rejects.toThrow();
    });

    it('should reject insert with invalid ParentId', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.control.insert.mutate({
          ParentId: 'not-a-uuid',
          Title: 'Bad Parent Control',
        })
      ).rejects.toThrow();
    });

    it('should persist owner when OwnerUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with Owner',
        OwnerUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      expect(controls[0]?.owners).toHaveLength(1);
      expect(controls[0]?.owners[0]?.UserId).toBe(userId);
    });

    it('should persist contributor when ContributorUserIds is provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with Contributor',
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      expect(controls[0]?.contributors).toHaveLength(1);
      expect(controls[0]?.contributors[0]?.UserId).toBe(userId);
    });

    it('should persist both owners and contributors together', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with Owners and Contributors',
        OwnerUserIds: [userId],
        ContributorUserIds: [userId],
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      expect(controls[0]?.owners).toHaveLength(1);
      expect(controls[0]?.contributors).toHaveLength(1);
    });

    it('should insert a control with empty relationship arrays', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with no relationships',
        OwnerUserIds: [],
        OwnerGroupIds: [],
        ContributorUserIds: [],
        ContributorGroupIds: [],
        TagTypeIds: [],
        DepartmentTypeIds: [],
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls[0]?.owners).toHaveLength(0);
      expect(controls[0]?.contributors).toHaveLength(0);
    });

    it('should persist tags and departments when TagTypeIds and DepartmentTypeIds are provided', async () => {
      const { orgKey, userId, trpcClient } = context;

      const parentRisk = await insertRisk(buildRisk({ orgKey, userId }));
      if (!parentRisk) {
        throw new Error('Failed to insert parent risk');
      }

      const tagType = await insertTagType(
        buildTagType(orgKey, userId, { Name: 'Control Tag' })
      );
      const departmentType = await insertDepartmentType(
        buildDepartmentType(orgKey, userId, { Name: 'Control Department' })
      );

      const response = await trpcClient.frontend.control.insert.mutate({
        ParentId: parentRisk.Id,
        Title: 'Control with tags and departments',
        TagTypeIds: [tagType!.TagTypeId],
        DepartmentTypeIds: [departmentType!.DepartmentTypeId],
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      expect(controls[0]?.tags).toHaveLength(1);
      expect(controls[0]?.tags[0]?.TagTypeId).toBe(tagType!.TagTypeId);
      expect(controls[0]?.departments).toHaveLength(1);
      expect(controls[0]?.departments[0]?.DepartmentTypeId).toBe(
        departmentType!.DepartmentTypeId
      );
    });

    it('should create schedule_state with DueDate equal to StartDate for non-adhoc schedule', async () => {
      const { trpcClient } = context;

      const startDate = '2026-03-01T00:00:00.000Z';

      const response = await trpcClient.frontend.control.insert.mutate({
        Title: 'Control with schedule',
        Schedule: {
          Frequency: TestFrequency.Monthly,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      const scheduleState = controls[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(startDate);
      expect(scheduleState!.OverdueDate).toBeNull();
      expect(scheduleState!.LatestDate).toBeNull();
    });

    it('should create schedule_state with ManualDueDate for adhoc schedule', async () => {
      const { trpcClient } = context;

      const manualDueDate = '2026-06-15T00:00:00.000Z';

      const response = await trpcClient.frontend.control.insert.mutate({
        Title: 'Control with adhoc schedule',
        Schedule: {
          Frequency: TestFrequency.Adhoc,
          StartDate: null,
          ManualDueDate: manualDueDate,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      const scheduleState = controls[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(
        manualDueDate
      );
      expect(scheduleState!.LatestDate).toBeNull();
    });

    it('should calculate OverdueDate from DueDate and TimeToComplete', async () => {
      const { trpcClient } = context;

      const startDate = '2026-03-01T00:00:00.000Z';

      const response = await trpcClient.frontend.control.insert.mutate({
        Title: 'Control with overdue',
        Schedule: {
          Frequency: TestFrequency.Weekly,
          StartDate: startDate,
          ManualDueDate: null,
          TimeToCompleteValue: 5,
          TimeToCompleteUnit: UnitOfTime.Day,
        },
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      const scheduleState = controls[0]?.scheduleState;
      expect(scheduleState).toBeDefined();
      expect(new Date(scheduleState!.DueDate!).toISOString()).toBe(startDate);
      expect(new Date(scheduleState!.OverdueDate!).toISOString()).toBe(
        '2026-03-06T00:00:00.000Z'
      );
    });

    it('should not create schedule_state when no Schedule is provided', async () => {
      const { trpcClient } = context;

      const response = await trpcClient.frontend.control.insert.mutate({
        Title: 'Control without schedule',
      });

      expect(response.Id).toBeDefined();

      const controls = await trpcClient.frontend.control.controlById.query({
        controlId: response.Id,
      });
      expect(controls).toHaveLength(1);
      expect(controls[0]?.scheduleState).toBeNull();
    });
  });
});
