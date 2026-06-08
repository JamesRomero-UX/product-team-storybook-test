import {
  ListTargetsByRuleCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import type { Context } from 'aws-lambda';
import type { EventBridgeEvent } from 'aws-lambda/trigger/eventbridge';
import type { DataExportSchedule } from 'generated/graphql';
import { DataExportScheduleStatusEnum } from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getOrgFeatures } from 'src/services/orgUtilities';
import { stub } from 'src/testing/stub';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { DataChangeEvent } from '../../events/DataChangeEvent';

const sendMock = vi.fn();
const mockUpdateDataExportSchedule = vi.fn();
const mockDeactivateDataExportScheduleByArn = vi.fn();

vi.mock('@aws-sdk/client-eventbridge', () => ({
  EventBridgeClient: vi.fn(() => ({
    send: sendMock,
  })),
  PutRuleCommand: vi.fn((input) => ({ input })),
  ListTargetsByRuleCommand: vi.fn((input) => ({ input })),
  RemoveTargetsCommand: vi.fn((input) => ({ input })),
  PutTargetsCommand: vi.fn((input) => ({ input })),
}));

vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));

vi.mock('../../session', () => ({
  getSessionData: vi.fn(() => ({
    tenant: 'test-tenant',
    orgKey: 'test-org',
  })),
}));

vi.mock('src/services/orgUtilities');
const getOrgFeaturesMock = vi.mocked(getOrgFeatures);

import { handler } from './scheduleChange';

describe('scheduleChange handler', () => {
  const mockEnvironment = {
    SST_STAGE: 'test',
    SCHEDULED_DATA_EXPORT_HANDLER_ARN: 'test-handler-arn',
  };
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, ...mockEnvironment };

    // Mock current time to 2023-01-01
    vi.setSystemTime(new Date('2023-01-03T00:00:00Z'));

    getOrgFeaturesMock.mockResolvedValue([]);
    vi.mocked(getBackendRestApiClient).mockReturnValue({
      updateDataExportSchedule: mockUpdateDataExportSchedule,
      deactivateDataExportScheduleByArn: mockDeactivateDataExportScheduleByArn,
    } as unknown as Sdk);
    mockUpdateDataExportSchedule.mockResolvedValue({});
    mockDeactivateDataExportScheduleByArn.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should create an EventBridge rule and target for a daily schedule', async () => {
    const mockEvent = stub<
      EventBridgeEvent<
        string,
        DataChangeEvent<DataExportSchedule, 'data_export_schedule'>
      >
    >({
      detail: {
        event: {
          session_variables: {},
          data: {
            new: {
              Id: 'test-schedule-id',
              SecretArn: 'test-secret-arn',
              OrgKey: 'test-org',
              Frequency: 'daily',
              StartTimestamp: '2023-01-01T00:00:00Z',
              EndTimestamp: '2023-12-31T00:00:00Z',
            },
          },
        },
      },
    });

    // Mock responses for each command
    sendMock
      // First call for PutRuleCommand
      .mockResolvedValueOnce({ RuleArn: 'test-rule-arn' })
      // Second call for ListTargetsByRuleCommand
      .mockResolvedValueOnce({ Targets: [] })
      // Third call for PutTargetsCommand
      .mockResolvedValueOnce({});

    await handler(mockEvent, stub<Context>({}), vi.fn());

    // Verify PutRuleCommand was called correctly
    expect(PutRuleCommand).toHaveBeenCalledWith({
      Name: 'test-DataExportScheduleRule-test-org',
      ScheduleExpression: expect.stringContaining('cron('),
      State: 'ENABLED',
      Description: 'Data export cron for schedule test-schedule-id',
    });

    // Verify ListTargetsByRuleCommand was called correctly
    expect(ListTargetsByRuleCommand).toHaveBeenCalledWith({
      Rule: 'test-DataExportScheduleRule-test-org',
    });

    // Verify PutTargetsCommand was called correctly
    expect(PutTargetsCommand).toHaveBeenCalledWith({
      Rule: 'test-DataExportScheduleRule-test-org',
      Targets: [
        {
          Id: 'data-export-executor-test-schedule-id',
          Arn: 'test-handler-arn',
          Input: JSON.stringify({
            ruleName: 'test-DataExportScheduleRule-test-org',
            scheduleId: 'test-schedule-id',
            secretArn: 'test-secret-arn',
            startTimestamp: '2023-01-01T00:00:00Z',
            endTimestamp: '2023-12-31T00:00:00Z',
          }),
        },
      ],
    });

    expect(mockDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
    });

    expect(mockUpdateDataExportSchedule).toHaveBeenCalledWith({
      Id: 'test-schedule-id',
      CronArn: 'test-rule-arn',
      Status: DataExportScheduleStatusEnum.Active,
      Executions: [
        {
          ExecutionTimestamp: '2023-01-04T00:00:00.000Z',
          ParentId: 'test-schedule-id',
          Status: 'scheduled',
        },
      ],
    });
  });

  it('should handle weekly schedule frequency', async () => {
    const mockEvent = stub<
      EventBridgeEvent<
        string,
        DataChangeEvent<DataExportSchedule, 'data_export_schedule'>
      >
    >({
      detail: {
        event: {
          session_variables: {},
          data: {
            new: {
              Id: 'test-schedule-id',
              SecretArn: 'test-secret-arn',
              OrgKey: 'test-org',
              Frequency: 'weekly',
              StartTimestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
    });

    sendMock
      .mockResolvedValueOnce({ RuleArn: 'test-rule-arn' })
      .mockResolvedValueOnce({ Targets: [] })
      .mockResolvedValueOnce({});

    await handler(mockEvent, stub<Context>({}), vi.fn());

    expect(PutTargetsCommand).toHaveBeenCalledWith({
      Rule: 'test-DataExportScheduleRule-test-org',
      Targets: [
        {
          Id: 'data-export-executor-test-schedule-id',
          Arn: 'test-handler-arn',
          Input: JSON.stringify({
            ruleName: 'test-DataExportScheduleRule-test-org',
            scheduleId: 'test-schedule-id',
            secretArn: 'test-secret-arn',
            startTimestamp: '2023-01-01T00:00:00Z',
          }),
        },
      ],
    });

    expect(mockDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
    });

    expect(mockUpdateDataExportSchedule).toHaveBeenCalledWith({
      Id: 'test-schedule-id',
      CronArn: 'test-rule-arn',
      Status: DataExportScheduleStatusEnum.Active,
      Executions: [
        {
          ExecutionTimestamp: '2023-01-09T00:00:00.000Z',
          ParentId: 'test-schedule-id',
          Status: 'scheduled',
        },
      ],
    });
  });

  it('should remove existing targets when updating a rule', async () => {
    const mockExistingTargets = [{ Id: 'existing-target' }];
    const mockEvent = stub<
      EventBridgeEvent<
        string,
        DataChangeEvent<DataExportSchedule, 'data_export_schedule'>
      >
    >({
      detail: {
        event: {
          session_variables: {},
          data: {
            new: {
              Id: 'test-schedule-id',
              SecretArn: 'test-secret-arn',
              OrgKey: 'test-org',
              Frequency: 'monthly',
              StartTimestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
    });

    sendMock
      .mockResolvedValueOnce({ RuleArn: 'test-rule-arn' })
      .mockResolvedValueOnce({ Targets: mockExistingTargets })
      .mockResolvedValueOnce({}) // RemoveTargetsCommand response
      .mockResolvedValueOnce({}); // PutTargetsCommand response

    await handler(mockEvent, stub<Context>({}), vi.fn());

    expect(RemoveTargetsCommand).toHaveBeenCalledWith({
      Rule: 'test-DataExportScheduleRule-test-org',
      Ids: ['existing-target'],
    });

    expect(mockDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
    });

    expect(sendMock).toHaveBeenCalledTimes(4);
  });

  it('should throw error when handler ARN is not set', async () => {
    delete process.env.SCHEDULED_DATA_EXPORT_HANDLER_ARN;

    const mockEvent = stub<
      EventBridgeEvent<
        string,
        DataChangeEvent<DataExportSchedule, 'data_export_schedule'>
      >
    >({
      detail: {
        event: {
          session_variables: {},
          data: {
            new: {
              Id: 'test-schedule-id',
              SecretArn: 'test-secret-arn',
              OrgKey: 'test-org',
              Frequency: 'daily',
              StartTimestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
    });

    await expect(
      handler(mockEvent, stub<Context>({}), vi.fn())
    ).rejects.toThrow(
      'SCHEDULED_DATA_EXPORT_HANDLER_ARN environment variable is not set'
    );
  });

  it('should handle EventBridge errors properly', async () => {
    const error = new Error('EventBridge error');
    sendMock.mockRejectedValueOnce(error);

    const mockEvent = stub<
      EventBridgeEvent<
        string,
        DataChangeEvent<DataExportSchedule, 'data_export_schedule'>
      >
    >({
      detail: {
        event: {
          session_variables: {},
          data: {
            new: {
              Id: 'test-schedule-id',
              SecretArn: 'test-secret-arn',
              OrgKey: 'test-org',
              Frequency: 'daily',
              StartTimestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
    });

    await expect(
      handler(mockEvent, stub<Context>({}), vi.fn())
    ).rejects.toThrow('EventBridge error');
  });
});
