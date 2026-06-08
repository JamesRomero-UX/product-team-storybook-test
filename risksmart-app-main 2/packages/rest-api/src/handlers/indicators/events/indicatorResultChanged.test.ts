import type { ApolloClient } from '@apollo/client';
import type { Context, EventBridgeEvent } from 'aws-lambda';
import type { IndicatorResult } from 'generated/graphql';
import { ParentTypeEnum, TestFrequencyEnum } from 'generated/graphql';
import type { Sdk } from 'generated/graphql2';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { stub } from 'src/testing/stub';
import { buildSchedule } from 'src/testing/test-data/scheduleBuilder';
import { buildScheduleState } from 'src/testing/test-data/scheduleStateBuilder';
import { vi, vitest } from 'vitest';

import { handler } from './indicatorResultChanged';
vi.mock('src/adminGraphqlClient');
vi.mock('src/services/indicator/indicatorService');

vi.mock('src/adminGraphqlClient');
vi.mock('src/backendGraphqlClient');

vi.mock('src/repositories/getRisksmartApiClient', async () => {
  const sdk: Sdk = {
    ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
    getLatestIndicatorResult: vi.fn(),
    upsertScheduleState: vi.fn(),
    getScheduleState: vi.fn(),
    getSchedule: vi.fn(),
    getNode: vi.fn(),
  };

  return { getRisksmartApiClient: () => sdk };
});
const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));
const getNodeMock = vi.mocked(apiClient.getNode);
const getScheduleMock = vi.mocked(apiClient.getSchedule);
const getScheduleStateMock = vi.mocked(apiClient.getScheduleState);
const getLatestIndicatorResultMock = vi.mocked(
  apiClient.getLatestIndicatorResult
);
const upsertScheduleStateMock = vi.mocked(apiClient.upsertScheduleState);
describe('indicatorResultChanged', () => {
  beforeEach(() => {
    vitest.resetAllMocks();
    getNodeMock.mockResolvedValue({
      node_by_pk: {
        ObjectType: ParentTypeEnum.Indicator,
        Id: '123',
        ancestorContributors: [],
      },
    });
  });

  it('throws an error on missing Indicator Id', async () => {
    await expect(
      handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<IndicatorResult, 'indicator_result'>
          >
        >({
          detail: {
            table: { name: 'indicator_result' },
            event: {
              data: {
                new: {
                  Id: '1',
                  IndicatorId: undefined,
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      )
    ).rejects.toThrow('Indicator Id not found');
  });

  it('throws error on failed update of dates', async () => {
    const indicatorId = '84b79957-3a77-44cc-bf38-2717b018739f';

    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Frequency: TestFrequencyEnum.Daily,
      }),
    });
    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: '2024-09-02T10:09:27Z',
        DueDate: '2024-09-02T10:09:27Z',
      }),
    });

    getLatestIndicatorResultMock.mockResolvedValue({
      indicator_result: [
        {
          Id: '',
          IndicatorId: indicatorId,
          ResultDate: '2024-10-02T00:00:00Z',
        },
      ],
    });
    upsertScheduleStateMock.mockRejectedValueOnce({
      message: 'Failed to update indicator result dates',
    });

    await expect(
      handler(
        stub<
          EventBridgeEvent<
            string,
            DataChangeEvent<IndicatorResult, 'indicator_result'>
          >
        >({
          detail: {
            table: { name: 'indicator_result' },
            event: {
              data: {
                new: {
                  Id: '1',
                  IndicatorId: indicatorId,
                },
              },
            },
          },
        }),
        stub<Context>({}),
        vi.fn()
      )
    ).rejects.toThrow('Failed to update indicator result dates');
  });

  it('updates dates when latest result found', async () => {
    const indicatorId = '84b79957-3a77-44cc-bf38-2717b018739f';

    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Id: indicatorId,
        Frequency: TestFrequencyEnum.Daily,
        StartDate: '2024-10-01T00:00:00Z',
      }),
    });
    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: '2024-09-02T10:09:27Z',
        DueDate: '2024-09-02T10:09:27Z',
      }),
    });

    getLatestIndicatorResultMock.mockResolvedValue({
      indicator_result: [
        {
          Id: '',
          IndicatorId: indicatorId,
          ResultDate: '2024-10-02T00:00:00Z',
        },
      ],
    });
    upsertScheduleStateMock.mockResolvedValue({
      insert_schedule_state_one: {
        Id: '',
      },
    });

    await handler(
      stub<
        EventBridgeEvent<
          string,
          DataChangeEvent<IndicatorResult, 'indicator_result'>
        >
      >({
        detail: {
          table: { name: 'indicator_result' },
          event: {
            data: {
              new: {
                Id: '1',
                IndicatorId: indicatorId,
              },
            },
          },
        },
      }),
      stub<Context>({}),
      vi.fn()
    );
    expect(upsertScheduleStateMock).toHaveBeenCalledWith(
      expect.objectContaining<
        Partial<Parameters<typeof upsertScheduleStateMock>[0]>
      >({
        Id: indicatorId,
        LatestDate: '2024-10-02T00:00:00Z',
        ModifiedByUser: 'SYSTEM',
        DueDate: '2024-10-03T00:00:00.000Z',
      })
    );
  });

  it('sets dates to null if no latest result found', async () => {
    const indicatorId = '84b79957-3a77-44cc-bf38-2717b018739f';

    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Id: indicatorId,
        Frequency: TestFrequencyEnum.Daily,
      }),
    });
    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: '2024-10-03T00:00:00.000Z',
        OverdueDate: '2024-10-03T00:00:00.000Z',
        DueDate: '2024-10-03T00:00:00.000Z',
      }),
    });

    getLatestIndicatorResultMock.mockResolvedValue({ indicator_result: [] });
    upsertScheduleStateMock.mockResolvedValue({
      insert_schedule_state_one: {
        Id: indicatorId,
      },
    });

    await handler(
      stub<
        EventBridgeEvent<
          string,
          DataChangeEvent<IndicatorResult, 'indicator_result'>
        >
      >({
        detail: {
          table: { name: 'indicator_result' },
          event: {
            data: {
              new: {
                Id: '1',
                IndicatorId: indicatorId,
              },
            },
          },
        },
      }),
      stub<Context>({}),
      vi.fn()
    );
    expect(upsertScheduleStateMock).toHaveBeenCalledWith(
      expect.objectContaining<
        Partial<Parameters<typeof upsertScheduleStateMock>[0]>
      >({
        Id: indicatorId,
        LatestDate: null,
        OverdueDate: null,
        ModifiedByUser: 'SYSTEM',
        DueDate: null,
      })
    );
  });

  it('performs no update if dates remain unchanged', async () => {
    const indicatorId = '84b79957-3a77-44cc-bf38-2717b018739f';

    getScheduleMock.mockResolvedValue({
      schedule_by_pk: buildSchedule({
        Id: indicatorId,
        Frequency: TestFrequencyEnum.Daily,
      }),
    });
    getScheduleStateMock.mockResolvedValue({
      schedule_state_by_pk: buildScheduleState({
        LatestDate: null,
        DueDate: null,
        OverdueDate: null,
      }),
    });

    getLatestIndicatorResultMock.mockResolvedValue({ indicator_result: [] });

    await handler(
      stub<
        EventBridgeEvent<
          string,
          DataChangeEvent<IndicatorResult, 'indicator_result'>
        >
      >({
        detail: {
          table: { name: 'indicator_result' },
          event: {
            data: {
              new: {
                Id: '1',
                IndicatorId: indicatorId,
              },
            },
          },
        },
      }),
      stub<Context>({}),
      vi.fn()
    );
    expect(upsertScheduleStateMock).toHaveBeenCalledTimes(0);
  });
});
