import { DataExportExecutionStatus } from '@risksmart-app/domain/src/types/consts/data-export-execution-status';
import { DataExportFrequency } from '@risksmart-app/domain/src/types/consts/data-export-frequency';
import { DataExportStatus } from '@risksmart-app/domain/src/types/consts/data-export-status';
import { DataExportStorageType } from '@risksmart-app/domain/src/types/consts/data-export-storage-type';
import {
  buildDataExportSchedule,
  buildDataExportScheduleExecution,
  insertDataExportSchedule,
  insertDataExportScheduleExecution,
} from '@risksmart-app/test-data';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('data-export', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('getActiveSchedule', () => {
    it('should return empty array when no schedules exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toEqual([]);
    });

    it('should return active schedule', async () => {
      const { orgKey, userId, trpcClient } = context;

      const scheduleInput = buildDataExportSchedule({ orgKey, userId });
      await insertDataExportSchedule(scheduleInput);

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toHaveLength(1);
    });

    it('should not return inactive schedules', async () => {
      const { orgKey, userId, trpcClient } = context;

      const scheduleInput = buildDataExportSchedule({
        orgKey,
        userId,
        overrides: { Status: DataExportStatus.Inactive },
      });
      await insertDataExportSchedule(scheduleInput);

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toEqual([]);
    });

    it('should return schedule with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const scheduleInput = buildDataExportSchedule({ orgKey, userId });
      const inserted = await insertDataExportSchedule(scheduleInput);

      if (!inserted) {
        throw new Error('Failed to insert data export schedule');
      }

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          Id: inserted.Id,
          Frequency: DataExportFrequency.Daily,
          StorageType: DataExportStorageType.AmazonS3,
          Status: DataExportStatus.Active,
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const scheduleInput = buildDataExportSchedule({ orgKey, userId });
      await insertDataExportSchedule(scheduleInput);

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty('OrgKey');
    });

    it('should return only the most recent active schedule', async () => {
      const { orgKey, userId, trpcClient } = context;

      const olderSchedule = buildDataExportSchedule({
        orgKey,
        userId,
        overrides: {
          CreatedAtTimestamp: new Date('2024-01-01').toISOString(),
        },
      });
      const newerSchedule = buildDataExportSchedule({
        orgKey,
        userId,
        overrides: {
          CreatedAtTimestamp: new Date('2025-01-01').toISOString(),
        },
      });

      await insertDataExportSchedule(olderSchedule);
      await insertDataExportSchedule(newerSchedule);

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.Id).toBe(newerSchedule.Id);
    });

    it('should return timestamps', async () => {
      const { orgKey, userId, trpcClient } = context;

      const scheduleInput = buildDataExportSchedule({ orgKey, userId });
      await insertDataExportSchedule(scheduleInput);

      const response =
        await trpcClient.frontend.dataExport.getActiveSchedule.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.CreatedAtTimestamp).toBeDefined();
      expect(response[0]?.ModifiedAtTimestamp).toBeDefined();
      expect(response[0]?.StartTimestamp).toBeDefined();
    });
  });

  describe('getScheduleExecutions', () => {
    it('should return empty array when no executions exist', async () => {
      const { trpcClient } = context;

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toEqual([]);
    });

    it('should return schedule executions', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({ orgKey, userId });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const executionInput = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: { ParentId: insertedSchedule.Id },
      });
      await insertDataExportScheduleExecution(executionInput);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(1);
    });

    it('should return execution with expected fields', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({ orgKey, userId });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const executionInput = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: { ParentId: insertedSchedule.Id },
      });
      await insertDataExportScheduleExecution(executionInput);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(1);
      expect(response[0]).toEqual(
        expect.objectContaining({
          ParentId: insertedSchedule.Id,
          Status: DataExportExecutionStatus.Complete,
          CreatedByUser: userId,
          ModifiedByUser: userId,
        })
      );
    });

    it('should not return OrgKey field', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({ orgKey, userId });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const executionInput = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: { ParentId: insertedSchedule.Id },
      });
      await insertDataExportScheduleExecution(executionInput);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(1);
      expect(response[0]).not.toHaveProperty('OrgKey');
    });

    it('should include related schedule data', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({
        orgKey,
        userId,
        overrides: {
          Frequency: DataExportFrequency.Weekly,
        },
      });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const executionInput = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: { ParentId: insertedSchedule.Id },
      });
      await insertDataExportScheduleExecution(executionInput);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.dataExportSchedule).toBeDefined();
      expect(response[0]?.dataExportSchedule?.Frequency).toBe(
        DataExportFrequency.Weekly
      );
    });

    it('should return multiple executions', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({ orgKey, userId });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const execution1 = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: {
          ParentId: insertedSchedule.Id,
          ExecutionTimestamp: new Date('2025-01-01').toISOString(),
        },
      });
      const execution2 = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: {
          ParentId: insertedSchedule.Id,
          ExecutionTimestamp: new Date('2025-02-01').toISOString(),
        },
      });

      await insertDataExportScheduleExecution(execution1);
      await insertDataExportScheduleExecution(execution2);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(2);
    });

    it('should return execution with error details', async () => {
      const { orgKey, userId, trpcClient } = context;

      const schedule = buildDataExportSchedule({ orgKey, userId });
      const insertedSchedule = await insertDataExportSchedule(schedule);

      if (!insertedSchedule) {
        throw new Error('Failed to insert data export schedule');
      }

      const executionInput = buildDataExportScheduleExecution({
        orgKey,
        userId,
        overrides: {
          ParentId: insertedSchedule.Id,
          Status: DataExportExecutionStatus.Failed,
          Errors: 'Connection timeout',
        },
      });
      await insertDataExportScheduleExecution(executionInput);

      const response =
        await trpcClient.frontend.dataExport.getScheduleExecutions.query();

      expect(response).toHaveLength(1);
      expect(response[0]?.Status).toBe(DataExportExecutionStatus.Failed);
      expect(response[0]?.Errors).toBe('Connection timeout');
    });
  });
});
