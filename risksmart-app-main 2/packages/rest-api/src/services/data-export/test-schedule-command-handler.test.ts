import { describe, expect, it, vi } from 'vitest';

import type { TestScheduleCommand } from './test-schedule-command-handler';
import { testScheduleCommandHandler } from './test-schedule-command-handler';

describe('test schedule command handler', () => {
  const mockGetDataExportSchedule = vi.fn();
  const mockGetCronTargets = vi.fn();
  const mockInvokeLambda = vi.fn();

  const handler = testScheduleCommandHandler({
    getDataExportSchedule: mockGetDataExportSchedule,
    getCronTargets: mockGetCronTargets,
    invokeLambda: mockInvokeLambda,
  });

  const command: TestScheduleCommand = {
    scheduleId: 'test-schedule-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully initiate data export schedule test', async () => {
    const cronArn = 'arn:aws:events:us-east-1:123456789012:rule/test-cron-rule';
    const lambdaArn =
      'arn:aws:lambda:us-east-1:123456789012:function:test-function';

    mockGetDataExportSchedule.mockResolvedValue({ cronArn });
    mockGetCronTargets.mockResolvedValue([
      { Input: JSON.stringify({ some: 'data' }), Arn: lambdaArn },
    ]);

    await handler.execute(command);

    expect(mockGetDataExportSchedule).toHaveBeenCalledWith(command.scheduleId);
    expect(mockGetCronTargets).toHaveBeenCalledWith('test-cron-rule');
    expect(mockInvokeLambda).toHaveBeenCalledWith(
      lambdaArn,
      JSON.stringify({ some: 'data', manualTrigger: true })
    );
  });

  it('should throw error if no active data export schedule found', async () => {
    mockGetDataExportSchedule.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(
      'No active data export schedule found for given Id'
    );
  });

  it('should throw error if no cron name found in schedule', async () => {
    mockGetDataExportSchedule.mockResolvedValue({ cronArn: undefined });

    await expect(handler.execute(command)).rejects.toThrow(
      'Error processing data export schedule test'
    );
  });

  it('should throw error if no target input found for cron rule', async () => {
    const cronArn = 'arn:aws:events:us-east-1:123456789012:rule/test-cron-rule';
    mockGetDataExportSchedule.mockResolvedValue({ cronArn });
    mockGetCronTargets.mockResolvedValue([]); // No targets

    await expect(handler.execute(command)).rejects.toThrow(
      'No target input found for cron rule'
    );
  });

  it('should throw error if target has no input', async () => {
    const cronArn = 'arn:aws:events:us-east-1:123456789012:rule/test-cron-rule';
    mockGetDataExportSchedule.mockResolvedValue({ cronArn });
    mockGetCronTargets.mockResolvedValue([{ Arn: 'some-arn' }]); // No Input

    await expect(handler.execute(command)).rejects.toThrow(
      'No target input found for cron rule'
    );
  });

  it('should throw error if target has no ARN', async () => {
    const cronArn = 'arn:aws:events:us-east-1:123456789012:rule/test-cron-rule';
    const input = JSON.stringify({ some: 'data' });
    mockGetDataExportSchedule.mockResolvedValue({ cronArn });
    mockGetCronTargets.mockResolvedValue([{ Input: input }]); // No Arn

    await expect(handler.execute(command)).rejects.toThrow(
      'No Lambda function ARN found in EventBridge rule target'
    );
  });
});
