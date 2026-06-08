import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  DataExportScheduleFrequencyEnum,
  DataExportScheduleStorageTypeEnum,
} from 'generated/graphql';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
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

import { handler } from './createSchedule';
import { storeSecret } from './helpers/storeSecret';

vi.mock('./helpers/storeSecret');
const storeSecretMock = vi.mocked(storeSecret);

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
  })),
}));

vi.mock('../../session', () => ({
  getSessionData: vi.fn(() => ({
    tenant: 'test-tenant',
    orgKey: 'test-org',
  })),
}));

const insertDataExportScheduleMock = vi.fn();
vi.mock('src/repositories/getBackendRestApiClient', () => ({
  getBackendRestApiClient: vi.fn(),
}));

describe('createSchedule handler', () => {
  beforeAll(() => {
    process.env.SST_STAGE = 'test';
    insertDataExportScheduleMock.mockResolvedValue({});
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getBackendRestApiClient).mockReturnValue({
      insertDataExportSchedule: insertDataExportScheduleMock,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    delete process.env.SST_STAGE;
  });

  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  it('returns NOT_ACCEPTABLE for unsupported storage type', async () => {
    const event = stub<APIGatewayProxyEventV2>({
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: { name: 'dataExportCreateSchedule' },
        input: {
          object: {
            frequency: DataExportScheduleFrequencyEnum.Daily,
            storageType: DataExportScheduleStorageTypeEnum.AzureBlobStorage,
          },
        },
        session_variables: {
          'x-hasura-org-id': 'org1',
          'x-hasura-user-id': 'user1',
        },
      }),
    });

    const result = await handler(event, stub<Context>({}));

    expect(result.statusCode).toBe(406);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Unsupported storage type',
    });
  });

  it('should successfully create a data export schedule', async () => {
    insertDataExportScheduleMock.mockResolvedValueOnce({
      insert_data_export_schedule_one: { Id: 'test-schedule-id' },
    });
    storeSecretMock.mockResolvedValueOnce('test-secret-arn');

    const event = stub<APIGatewayProxyEventV2>({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: { name: 'dataExportCreateSchedule' },
        input: {
          object: {
            frequency: DataExportScheduleFrequencyEnum.Daily,
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            storageType: DataExportScheduleStorageTypeEnum.MsSharePoint,
            entraSecretValue: 'secret',
            entraTenantId: 'tenant-id',
            entraClientId: 'client-id',
            sharePointSiteId: 'site-id',
            sharePointDriveId: 'drive-id',
            spFolder: 'folder',
          },
        },
        session_variables: {
          'x-hasura-org-id': 'org1',
          'x-hasura-user-id': 'user1',
        },
      }),
    });

    const result = await handler(event, stub<Context>({}));

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Successfully created data export schedule',
      scheduleId: 'test-schedule-id',
    });

    expect(storeSecretMock).toHaveBeenCalledWith({
      tenant: 'test-tenant',
      orgKey: 'test-org',
      inputObject: expect.objectContaining({
        frequency: DataExportScheduleFrequencyEnum.Daily,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      }),
    });

    expect(insertDataExportScheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        Frequency: DataExportScheduleFrequencyEnum.Daily,
        SecretArn: 'test-secret-arn',
        StartTimestamp: expect.any(String),
        EndTimestamp: '2023-12-31',
      })
    );
  });

  it('should handle secret storage errors', async () => {
    insertDataExportScheduleMock.mockResolvedValueOnce({
      insert_data_export_schedule_one: { Id: 'test-schedule-id' },
    });
    storeSecretMock.mockRejectedValueOnce(new Error('Secret storage failed'));

    const event = stub<APIGatewayProxyEventV2>({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: { name: 'dataExportCreateSchedule' },
        input: {
          object: {
            frequency: DataExportScheduleFrequencyEnum.Weekly,
            storageType: DataExportScheduleStorageTypeEnum.MsSharePoint,
            entraSecretValue: 'secret',
            entraTenantId: 'tenant-id',
            entraClientId: 'client-id',
            sharePointSiteId: 'site-id',
            sharePointDriveId: 'drive-id',
            spFolder: 'folder',
          },
        },
        session_variables: {
          'x-hasura-org-id': 'org1',
          'x-hasura-user-id': 'user1',
        },
      }),
    });

    const result = await handler(event, stub<Context>({}));

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body!)).toEqual({
      message:
        'Failed to create data export schedule: could not store credentials',
    });
    expect(insertDataExportScheduleMock).not.toHaveBeenCalled();
  });

  it('should handle database insertion errors', async () => {
    insertDataExportScheduleMock.mockRejectedValueOnce(
      new Error('DB insertion failed')
    );
    storeSecretMock.mockResolvedValueOnce('test-secret-arn');

    const event = stub<APIGatewayProxyEventV2>({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: { name: 'dataExportCreateSchedule' },
        input: {
          object: {
            frequency: DataExportScheduleFrequencyEnum.Monthly,
            storageType: DataExportScheduleStorageTypeEnum.MsSharePoint,
            entraSecretValue: 'secret',
            entraTenantId: 'tenant-id',
            entraClientId: 'client-id',
            sharePointSiteId: 'site-id',
            sharePointDriveId: 'drive-id',
            spFolder: 'folder',
          },
        },
        session_variables: {
          'x-hasura-org-id': 'org1',
          'x-hasura-user-id': 'user1',
        },
      }),
    });

    const result = await handler(event, stub<Context>({}));

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Failed to create data export schedule',
    });
    expect(storeSecretMock).toHaveBeenCalled();
    expect(insertDataExportScheduleMock).toHaveBeenCalled();
  });

  it('should use current date when startDate is not provided', async () => {
    insertDataExportScheduleMock.mockResolvedValueOnce({
      insert_data_export_schedule_one: { Id: 'test-schedule-id' },
    });
    storeSecretMock.mockResolvedValueOnce('test-secret-arn');

    const event = stub<APIGatewayProxyEventV2>({
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: { name: 'dataExportCreateSchedule' },
        input: {
          object: {
            frequency: DataExportScheduleFrequencyEnum.Monthly,
            storageType: DataExportScheduleStorageTypeEnum.MsSharePoint,
            entraSecretValue: 'secret',
            entraTenantId: 'tenant-id',
            entraClientId: 'client-id',
            sharePointSiteId: 'site-id',
            sharePointDriveId: 'drive-id',
            spFolder: 'folder',
          },
        },
        session_variables: {
          'x-hasura-org-id': 'org1',
          'x-hasura-user-id': 'user1',
        },
      }),
    });

    const result = await handler(event, stub<Context>({}));

    expect(result.statusCode).toBe(200);
    expect(insertDataExportScheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        StartTimestamp: expect.any(String),
      })
    );
  });
});
