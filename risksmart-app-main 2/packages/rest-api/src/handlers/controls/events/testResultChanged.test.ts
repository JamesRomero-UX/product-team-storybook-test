import type { ApolloClient } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { TestResult } from 'generated/graphql';
import { ParentTypeEnum, TestFrequencyEnum } from 'generated/graphql';
import type { Sdk } from 'src/repositories/getRisksmartApiClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { buildSchedule } from 'src/testing/test-data/scheduleBuilder';
import { vi } from 'vitest';

import { stub } from '../../../testing/stub';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
import { handler } from './testResultChanged';

vi.mock('src/adminGraphqlClient');
vi.mock('src/backendGraphqlClient');

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getLatestTestResultByParentControlId: vi.fn(),
    upsertScheduleState: vi.fn(),
    getScheduleState: vi.fn(),
    getSchedule: vi.fn(),
    getNode: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});

const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));

const getLatestTestResultByParentControlIdMock = vi.mocked(
  apiClient.getLatestTestResultByParentControlId
);
const getScheduleMock = vi.mocked(apiClient.getSchedule);
const upsertScheduleStateMock = vi.mocked(apiClient.upsertScheduleState);
const getScheduleStateMock = vi.mocked(apiClient.getScheduleState);
const getNodeMock = vi.mocked(apiClient.getNode);

describe('testResultChangedHandler', () => {
  const controlId = 'control-1';
  const mockDate = new Date(Date.UTC(2024, 4, 4, 13, 14, 16));
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({
      toFake: ['Date'],
    }).setSystemTime(mockDate);
    getScheduleStateMock.mockResolvedValue({});
    getNodeMock.mockResolvedValue({
      node_by_pk: {
        ObjectType: ParentTypeEnum.Control,
        Id: controlId,
        ancestorContributors: [],
      },
    });
  });
  afterEach(() => {
    //restore timers
    vi.useRealTimers();
  });

  it('updates the schedule, calculates the next date when frequency defined', async () => {
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-01T00:00:00.000Z',
      }),
    });

    getLatestTestResultByParentControlIdMock.mockResolvedValue({
      test_result: [
        {
          TestDate: '2024-05-15T00:00:00.000Z',
          Id: 'control-res-1',
        },
      ],
    });

    await handler(
      stub<
        EventBridgeEvent<string, DataChangeEvent<TestResult, 'test_result'>>
      >({
        detail: {
          table: { name: 'test_result' },
          event: {
            data: {
              new: {
                Id: 'control-res-1',
                ParentControlId: controlId,
                OrgKey: 'org-id',
                TestDate: '2024-05-15T00:00:00.000Z',
              },
            },
          },
        },
      }),
      stub<Context>({}),
      vi.fn()
    );

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Partial<Parameters<typeof upsertScheduleStateMock>>
    >({
      Id: controlId,
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: null,
      LatestDate: '2024-05-15T00:00:00.000Z',
      ModifiedByUser: 'SYSTEM',
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      OrgKey: undefined,
    });
    expect(getLatestTestResultByParentControlIdMock).toHaveBeenCalledWith({
      Id: controlId,
    });
  });

  it('updated the schedule when no test results exist', async () => {
    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-05-15T00:00:00.000Z',
      }),
    });

    getLatestTestResultByParentControlIdMock.mockResolvedValue({
      test_result: [],
    });

    await handler(
      stub<
        EventBridgeEvent<string, DataChangeEvent<TestResult, 'test_result'>>
      >({
        detail: {
          table: { name: 'test_result' },
          event: {
            data: {
              old: {
                Id: 'control-res-1',
                ParentControlId: controlId,
                OrgKey: 'org-id',
                TestDate: '2024-05-15T00:00:00.000Z',
              },
            },
          },
        },
      }),
      stub<Context>({}),
      vi.fn()
    );

    expect(upsertScheduleStateMock).toHaveBeenCalledWith<
      Partial<Parameters<typeof upsertScheduleStateMock>>
    >({
      Id: controlId,
      LatestDate: null,
      ModifiedAtTimestamp: '2024-05-04T13:14:16.000Z',
      ModifiedByUser: 'SYSTEM',
      DueDate: '2024-05-15T00:00:00.000Z',
      OverdueDate: null,
      OrgKey: undefined,
    });
    expect(getLatestTestResultByParentControlIdMock).toHaveBeenCalledWith({
      Id: controlId,
    });
  });
});
