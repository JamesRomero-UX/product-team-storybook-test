import type { ApolloClient } from '@apollo/client';
import type { Sdk } from 'generated/graphql2';
import { ParentTypeEnum } from 'generated/graphql2';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { SessionData } from 'src/session';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import { refreshScheduleState } from './scheduleStateService';

describe('scheduleStateService', () => {
  vi.mock('src/repositories/getRisksmartApiClient', async () => {
    const sdk: Sdk = {
      ...(await vi.importActual('src/repositories/getRisksmartApiClient')),
      upsertScheduleState: vi.fn(),
      getScheduleState: vi.fn(),
      getSchedule: vi.fn(),
      getNode: vi.fn(),
    };

    return { getRisksmartApiClient: () => sdk };
  });
  vi.mock('src/adminGraphqlClient');
  vi.mock('src/backendGraphqlClient');

  const apiClient = getRisksmartApiClient(stub<ApolloClient<unknown>>({}));

  const getScheduleMock = vi.mocked(apiClient.getSchedule);
  const getScheduleStateMock = vi.mocked(apiClient.getScheduleState);

  const upsertScheduleStateMock = vi.mocked(apiClient.upsertScheduleState);
  const getNodeMock = vi.mocked(apiClient.getNode);
  const id = '1234';
  const session: SessionData = {
    orgKey: '',
    userId: '',
    userRole: '',
    tenant: '',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    getScheduleMock.mockResolvedValue({ schedule_by_pk: null });
    getScheduleStateMock.mockResolvedValue({ schedule_state_by_pk: null });
    getNodeMock.mockResolvedValue({
      node_by_pk: {
        ObjectType: ParentTypeEnum.Action,
        Id: id,
        ancestorContributors: [],
      },
    });
  });

  it('should clear the due and overdue if no schedule is found', async () => {
    const latestDate = '2021-01-01';
    await refreshScheduleState({
      id,
      latestDate,
      session,
    });
    expect(upsertScheduleStateMock).toHaveBeenCalledWith({
      DueDate: undefined,
      Id: id,
      LatestDate: latestDate,
      ModifiedAtTimestamp: expect.any(String),
      ModifiedByUser: 'SYSTEM',
      OrgKey: session.orgKey,
      OverdueDate: null,
    });
  });

  it('should should do nothing if the item no longer exists', async () => {
    const latestDate = '2021-01-01';
    getNodeMock.mockResolvedValue({
      node_by_pk: null,
    });
    await refreshScheduleState({
      id,
      latestDate,
      session,
    });
    expect(upsertScheduleStateMock).not.toHaveBeenCalled();
  });
});
