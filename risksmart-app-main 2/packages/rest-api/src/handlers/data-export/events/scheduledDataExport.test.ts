import type { Context } from 'aws-lambda';
import dayjs from 'dayjs';
import { DataExportScheduleExecutionStatusEnum } from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { SYSTEM_USER } from 'src/repositories/types';
import { stub } from 'src/testing/stub';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { disableDataExportRule } from '../helpers/disableDataExportRule';
import { getSecretFromArn } from '../helpers/getSecretFromArn';
import { processCustomAttributes } from '../helpers/processCustomAttributes';
import { uploadData } from '../helpers/scheduledDataUpload';
import type {
  ScheduledDataExportInput,
  SftpCredentials,
  SharePointCredentials,
} from '../types';
import { handler } from './scheduledDataExport';

vi.mock('src/eventBridgeHandler', () => ({
  scheduledEventHandler: vi.fn((fn) => {
    return async (input: ScheduledDataExportInput) => {
      return fn(input);
    };
  }),
}));

const mockGetNormalisedExportData = vi.fn();
const mockSystemDeactivateDataExportScheduleByArn = vi.fn();
const mockGetActiveDataExportById = vi.fn();
const mockUpsertDataExportScheduleExecutions = vi.fn();

vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));
vi.mock('../helpers/getSecretFromArn');
vi.mock('../helpers/scheduledDataUpload', () => ({
  uploadData: vi.fn(),
}));
vi.mock('../helpers/disableDataExportRule');
vi.mock('../helpers/processCustomAttributes', () => ({
  processCustomAttributes: vi.fn((data) => data),
}));

const getSecretFromArnMock = vi.mocked(getSecretFromArn);
const uploadDataMock = vi.mocked(uploadData);
const disableDataExportRuleMock = vi.mocked(disableDataExportRule);
const processCustomAttributesMock = vi.mocked(processCustomAttributes);

describe('scheduledDataExport handler', () => {
  const mockContext = stub<Context>({});
  const mockCallback = vi.fn();

  // Saturday, 15 June 2024 00:00:00 GMT
  const NOW = dayjs('2024-06-15T00:00:00Z').toDate();
  const YESTERDAY = dayjs(NOW).subtract(1, 'day').toDate();
  const TOMORROW = dayjs(NOW).add(1, 'day').toDate();
  const PAST_DATE = dayjs(NOW).subtract(5, 'day').toDate();
  const FUTURE_DATE = dayjs(NOW).add(5, 'day').toDate();
  const SUNDAY = dayjs('2024-06-16T00:00:00Z').toDate();

  beforeAll(() => {
    vi.setSystemTime(NOW.toISOString());
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getBackendRestApiClient).mockReturnValue({
      getNormalisedExportData: mockGetNormalisedExportData,
      getActiveDataExportById: mockGetActiveDataExportById,
      systemDeactivateDataExportScheduleByArn:
        mockSystemDeactivateDataExportScheduleByArn,
      upsertDataExportScheduleExecutions:
        mockUpsertDataExportScheduleExecutions,
    } as unknown as Sdk);
    mockGetNormalisedExportData.mockResolvedValue({ someData: 'test-data' });
    mockSystemDeactivateDataExportScheduleByArn.mockResolvedValue({});
    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: null,
        },
      ],
    });
    mockUpsertDataExportScheduleExecutions.mockResolvedValue({});
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should skip execution if schedule is for a future date', async () => {
    const input: ScheduledDataExportInput = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: TOMORROW.toISOString(),
    };

    await handler(input, mockContext, mockCallback);

    expect(getSecretFromArnMock).not.toHaveBeenCalled();
    expect(mockGetNormalisedExportData).not.toHaveBeenCalled();
    expect(mockSystemDeactivateDataExportScheduleByArn).not.toHaveBeenCalled();
    expect(uploadDataMock).not.toHaveBeenCalled();
  });

  it('should disable rule if schedule passed the end date', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: YESTERDAY.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: YESTERDAY.toISOString(),
          dataExportScheduleExecutions: [],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    await handler(input, mockContext, mockCallback);

    expect(getSecretFromArnMock).toHaveBeenCalledWith('test-secret-arn');
    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockSystemDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
      ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
    });
    expect(uploadDataMock).not.toHaveBeenCalled();
  });

  it('should cancel scheduled executions when schedule expires', async () => {
    const scheduledExecution1 = {
      ExecutionTimestamp: TOMORROW.toISOString(),
      Status: DataExportScheduleExecutionStatusEnum.Scheduled,
      ParentId: 'test-schedule-id',
    };
    const scheduledExecution2 = {
      ExecutionTimestamp: dayjs(TOMORROW).add(1, 'day').toISOString(),
      Status: DataExportScheduleExecutionStatusEnum.Scheduled,
      ParentId: 'test-schedule-id',
    };
    const completedExecution = {
      ExecutionTimestamp: YESTERDAY.toISOString(),
      Status: DataExportScheduleExecutionStatusEnum.Complete,
      ParentId: 'test-schedule-id',
    };

    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: YESTERDAY.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: YESTERDAY.toISOString(),
          dataExportScheduleExecutions: [
            scheduledExecution1,
            scheduledExecution2,
            completedExecution,
          ],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    await handler(input, mockContext, mockCallback);

    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
      inputs: [
        {
          ParentId: 'test-schedule-id',
          ExecutionTimestamp: scheduledExecution1.ExecutionTimestamp,
          Status: DataExportScheduleExecutionStatusEnum.Cancelled,
          OrgKey: 'test-org',
          ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
          ModifiedByUser: SYSTEM_USER,
          CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
          CreatedByUser: SYSTEM_USER,
        },
        {
          ParentId: 'test-schedule-id',
          ExecutionTimestamp: scheduledExecution2.ExecutionTimestamp,
          Status: DataExportScheduleExecutionStatusEnum.Cancelled,
          OrgKey: 'test-org',
          ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
          ModifiedByUser: SYSTEM_USER,
          CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
          CreatedByUser: SYSTEM_USER,
        },
      ],
    });
    expect(mockSystemDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
      ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
    });
    expect(uploadDataMock).not.toHaveBeenCalled();
  });

  it('should handle cancellation failure when schedule expires', async () => {
    const scheduledExecution = {
      ExecutionTimestamp: TOMORROW.toISOString(),
      Status: DataExportScheduleExecutionStatusEnum.Scheduled,
      ParentId: 'test-schedule-id',
    };

    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: YESTERDAY.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: YESTERDAY.toISOString(),
          dataExportScheduleExecutions: [scheduledExecution],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);
    disableDataExportRuleMock.mockResolvedValueOnce(undefined);

    const cancellationError = new Error(
      'Failed to cancel scheduled executions'
    );
    mockUpsertDataExportScheduleExecutions.mockRejectedValueOnce(
      cancellationError
    );

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Failed to cancel scheduled executions'
    );

    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
      inputs: [
        {
          ParentId: 'test-schedule-id',
          ExecutionTimestamp: scheduledExecution.ExecutionTimestamp,
          Status: DataExportScheduleExecutionStatusEnum.Cancelled,
          OrgKey: 'test-org',
          ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
          ModifiedByUser: SYSTEM_USER,
          CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
          CreatedByUser: SYSTEM_USER,
        },
      ],
    });
    // Should not proceed to deactivate schedule if cancellation fails
    expect(mockSystemDeactivateDataExportScheduleByArn).not.toHaveBeenCalled();
  });

  it('should successfully export data to SharePoint', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const mockSharePointCredentials: SharePointCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      entraSecretValue: 'test-secret',
      entraTenantId: 'test-tenant-id',
      entraClientId: 'test-client-id',
      sharePointSiteId: 'test-site-id',
      sharePointDriveId: 'test-drive-id',
      sPFolder: 'test-folder',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockSharePointCredentials);

    const mockExportData = { someData: 'test-data' };
    mockGetNormalisedExportData.mockResolvedValue(mockExportData);

    await handler(input, mockContext, mockCallback);

    expect(getSecretFromArnMock).toHaveBeenCalledWith('test-secret-arn');
    expect(mockGetNormalisedExportData).toHaveBeenCalledWith({
      orgKey: 'test-org',
    });
    expect(uploadDataMock).toHaveBeenCalledWith(
      mockExportData,
      mockSharePointCredentials
    );
  });

  it('should successfully export data to SFTP', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const mockSftpCredentials: SftpCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      hostname: 'sftp.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockSftpCredentials);

    const mockExportData = { someData: 'test-data' };
    mockGetNormalisedExportData.mockResolvedValue(mockExportData);

    await handler(input, mockContext, mockCallback);

    expect(getSecretFromArnMock).toHaveBeenCalledWith('test-secret-arn');
    expect(mockGetNormalisedExportData).toHaveBeenCalledWith({
      orgKey: 'test-org',
    });
    expect(uploadDataMock).toHaveBeenCalledWith(
      mockExportData,
      mockSftpCredentials
    );
  });

  it('should process custom attributes before uploading', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const mockCredentials: SftpCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      hostname: 'sftp.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    const mockExportData = { someData: 'test-data' };
    mockGetNormalisedExportData.mockResolvedValue(mockExportData);

    await handler(input, mockContext, mockCallback);

    expect(processCustomAttributesMock).toHaveBeenCalledWith(mockExportData);
    expect(uploadDataMock).toHaveBeenCalledWith(
      mockExportData,
      mockCredentials
    );
  });

  it('should throw error if export data fails', async () => {
    const input: ScheduledDataExportInput = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const mockSecretData: SharePointCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      entraSecretValue: 'test-secret',
      entraTenantId: 'test-tenant-id',
      entraClientId: 'test-client-id',
      sharePointSiteId: 'test-site-id',
      sharePointDriveId: 'test-drive-id',
      sPFolder: 'test-folder',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockSecretData);

    const exportError = new Error('Export data error');
    mockGetNormalisedExportData.mockRejectedValueOnce(exportError);

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Export data error'
    );
  });

  it('should handle and propagate errors during processing', async () => {
    const input: ScheduledDataExportInput = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const testError = new Error('Test error');
    getSecretFromArnMock.mockRejectedValueOnce(testError);

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Test error'
    );
  });

  it('should not disable schedule if end date is in the future', async () => {
    const input: ScheduledDataExportInput = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: FUTURE_DATE.toISOString(),
    };

    const mockSecretData: SharePointCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      entraSecretValue: 'test-secret',
      entraTenantId: 'test-tenant-id',
      entraClientId: 'test-client-id',
      sharePointSiteId: 'test-site-id',
      sharePointDriveId: 'test-drive-id',
      sPFolder: 'test-folder',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockSecretData);

    await handler(input, mockContext, mockCallback);

    expect(disableDataExportRuleMock).not.toHaveBeenCalled();
    expect(getSecretFromArnMock).toHaveBeenCalled();
    expect(mockGetNormalisedExportData).toHaveBeenCalledWith({
      orgKey: 'test-org',
    });
    expect(uploadDataMock).toHaveBeenCalled();
  });

  it('should throw error if disabling data export rule fails', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: YESTERDAY.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: YESTERDAY.toISOString(),
          dataExportScheduleExecutions: [],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    const disableError = new Error('Failed to disable rule');
    disableDataExportRuleMock.mockRejectedValueOnce(disableError);

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Failed to disable rule'
    );

    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockSystemDeactivateDataExportScheduleByArn).not.toHaveBeenCalled();
  });

  it('should throw error if updating schedule status fails during disable', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: YESTERDAY.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: YESTERDAY.toISOString(),
          dataExportScheduleExecutions: [],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);
    disableDataExportRuleMock.mockResolvedValueOnce(undefined);

    const updateError = new Error('Failed to update schedule status');
    mockSystemDeactivateDataExportScheduleByArn.mockRejectedValueOnce(
      updateError
    );

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Failed to update schedule status'
    );

    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockSystemDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
      ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
    });
  });

  it('should throw error if upload data fails', async () => {
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
    };

    const mockCredentials: SftpCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
      hostname: 'sftp.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpass',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    const mockExportData = { someData: 'test-data' };
    mockGetNormalisedExportData.mockResolvedValue(mockExportData);

    const uploadError = new Error('Failed to upload data');
    uploadDataMock.mockRejectedValueOnce(uploadError);

    await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
      'Failed to upload data'
    );

    expect(mockGetNormalisedExportData).toHaveBeenCalledWith({
      orgKey: 'test-org',
    });
    expect(uploadDataMock).toHaveBeenCalledWith(
      mockExportData,
      mockCredentials
    );
  });

  it('should handle schedule expiring exactly at boundary (end of today)', async () => {
    const endOfToday = dayjs().endOf('day');
    const input = {
      ruleName: 'test-rule',
      scheduleId: 'test-schedule-id',
      secretArn: 'test-secret-arn',
      startTimestamp: PAST_DATE.toISOString(),
      endTimestamp: endOfToday.toISOString(),
    };

    mockGetActiveDataExportById.mockResolvedValue({
      data_export_schedule: [
        {
          Id: 'test-schedule-id',
          Status: 'active',
          CronArn: 'test-rule-arn',
          Frequency: 'daily',
          EndTimestamp: endOfToday.toISOString(),
          dataExportScheduleExecutions: [],
        },
      ],
    });

    const mockCredentials = {
      tenant: 'test-tenant',
      orgKey: 'test-org',
    };
    getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

    await handler(input, mockContext, mockCallback);

    expect(disableDataExportRuleMock).toHaveBeenCalledWith('test-rule');
    expect(mockSystemDeactivateDataExportScheduleByArn).toHaveBeenCalledWith({
      CronArn: 'test-rule-arn',
      ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
    });
    expect(mockGetNormalisedExportData).not.toHaveBeenCalled();
    expect(uploadDataMock).not.toHaveBeenCalled();
  });

  describe('upsertDataExportScheduleExecutions tracking', () => {
    it('should set current execution to complete and schedule next Scheduled when no Scheduled execution configured', async () => {
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: null,
            dataExportScheduleExecutions: [],
          },
        ],
      });

      const mockCredentials: SftpCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      await handler(input, mockContext, mockCallback);

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Status: 'complete',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
            Errors: undefined,
          },
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: '2024-06-16T00:00:00.000Z',
            Status: 'scheduled',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
        ],
      });

      const callArgs =
        mockUpsertDataExportScheduleExecutions.mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      const nextExecution = callArgs.inputs[1];
      expect(dayjs(nextExecution.ExecutionTimestamp).isAfter(NOW)).toBe(true);
    });

    it('should set current execution to complete without next Scheduled when next execution is beyond end date', async () => {
      // Use a time later today as the end date - won't trigger disable check
      // (which checks if endTimestamp < tomorrow's start), but the next daily execution
      // (which would be tomorrow at 00:00) will be after end of today
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: NOW.toISOString(),
        endTimestamp: SUNDAY.toISOString(),
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'weekly',
            EndTimestamp: SUNDAY.toISOString(),
            dataExportScheduleExecutions: [
              {
                ExecutionTimestamp: NOW.toISOString(),
                Status: 'scheduled',
                ParentId: 'test-schedule-id',
              },
            ],
          },
        ],
      });

      const mockCredentials: SharePointCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        entraSecretValue: 'test-secret',
        entraTenantId: 'test-tenant-id',
        entraClientId: 'test-client-id',
        sharePointSiteId: 'test-site-id',
        sharePointDriveId: 'test-drive-id',
        sPFolder: 'test-folder',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      await handler(input, mockContext, mockCallback);

      // Should proceed with export (not disabled) but not schedule next execution
      expect(disableDataExportRuleMock).not.toHaveBeenCalled();
      expect(uploadDataMock).toHaveBeenCalled();
      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Status: 'complete',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
            Errors: undefined,
          },
        ],
      });
    });

    it('should use Scheduled execution timestamp when configured and set to complete', async () => {
      const ScheduledExecutionTime = dayjs(NOW).subtract(1, 'hour');
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: null,
            dataExportScheduleExecutions: [
              {
                ExecutionTimestamp: ScheduledExecutionTime.toISOString(),
                Status: 'scheduled',
              },
            ],
          },
        ],
      });

      const mockCredentials: SftpCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      await handler(input, mockContext, mockCallback);

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: ScheduledExecutionTime.toISOString(),
            Status: 'complete',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
            Errors: undefined,
          },
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: '2024-06-15T00:00:00.000Z',
            Status: 'scheduled',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
        ],
      });
    });

    it('should set current execution to failed with error message when upload fails', async () => {
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
        endTimestamp: FUTURE_DATE.toISOString(),
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: FUTURE_DATE.toISOString(),
            dataExportScheduleExecutions: [],
          },
        ],
      });

      const mockCredentials: SftpCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      const uploadError = new Error('SFTP connection failed');
      uploadDataMock.mockRejectedValueOnce(uploadError);

      await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
        'SFTP connection failed'
      );

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Errors: 'SFTP connection failed',
            Status: 'failed',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
          {
            ExecutionTimestamp: '2024-06-16T00:00:00.000Z',
            ParentId: 'test-schedule-id',
            Status: 'scheduled',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
        ],
      });
    });

    it('should set current execution to failed and schedule next Scheduled when upload fails', async () => {
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: null,
            dataExportScheduleExecutions: [],
          },
        ],
      });

      const mockCredentials: SharePointCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        entraSecretValue: 'test-secret',
        entraTenantId: 'test-tenant-id',
        entraClientId: 'test-client-id',
        sharePointSiteId: 'test-site-id',
        sharePointDriveId: 'test-drive-id',
        sPFolder: 'test-folder',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      const uploadError = new Error('SharePoint authentication failed');
      uploadDataMock.mockRejectedValueOnce(uploadError);

      await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
        'SharePoint authentication failed'
      );

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Errors: 'SharePoint authentication failed',
            Status: 'failed',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: '2024-06-16T00:00:00.000Z',
            Status: 'scheduled',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
        ],
      });

      const callArgs =
        mockUpsertDataExportScheduleExecutions.mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      const nextExecution = callArgs.inputs[1];
      expect(dayjs(nextExecution.ExecutionTimestamp).isAfter(NOW)).toBe(true);
    });

    it('should not schedule next Scheduled execution on manual trigger even on success', async () => {
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
        manualTrigger: true,
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: null,
            dataExportScheduleExecutions: [],
          },
        ],
      });

      const mockCredentials: SftpCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      await handler(input, mockContext, mockCallback);

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Status: 'complete',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
            Errors: undefined,
          },
        ],
      });
    });

    it('should not schedule next Scheduled execution on manual trigger even on failure', async () => {
      const input = {
        ruleName: 'test-rule',
        scheduleId: 'test-schedule-id',
        secretArn: 'test-secret-arn',
        startTimestamp: PAST_DATE.toISOString(),
        manualTrigger: true,
      };

      mockGetActiveDataExportById.mockResolvedValue({
        data_export_schedule: [
          {
            Id: 'test-schedule-id',
            Status: 'active',
            CronArn: 'test-rule-arn',
            Frequency: 'daily',
            EndTimestamp: null,
            dataExportScheduleExecutions: [],
          },
        ],
      });

      const mockCredentials: SftpCredentials = {
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass',
      };
      getSecretFromArnMock.mockResolvedValueOnce(mockCredentials);

      const mockExportData = { someData: 'test-data' };
      mockGetNormalisedExportData.mockResolvedValue(mockExportData);

      const uploadError = new Error('Manual export failed');
      uploadDataMock.mockRejectedValueOnce(uploadError);

      await expect(handler(input, mockContext, mockCallback)).rejects.toThrow(
        'Manual export failed'
      );

      expect(mockUpsertDataExportScheduleExecutions).toHaveBeenCalledWith({
        inputs: [
          {
            ParentId: 'test-schedule-id',
            ExecutionTimestamp: NOW.toISOString(),
            Errors: 'Manual export failed',
            Status: 'failed',
            ModifiedByUser: SYSTEM_USER,
            ModifiedAtTimestamp: '2024-06-15T00:00:00.000Z',
            CreatedByUser: SYSTEM_USER,
            CreatedAtTimestamp: '2024-06-15T00:00:00.000Z',
            OrgKey: 'test-org',
          },
        ],
      });
    });
  });
});
