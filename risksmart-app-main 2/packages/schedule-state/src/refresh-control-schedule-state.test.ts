import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshControlScheduleState } from './refresh-control-schedule-state';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext } from './types';

const mockRefreshScheduleStateFn = vi.fn();

vi.mock('./refresh-schedule-state', () => ({
  createRefreshScheduleState: vi.fn(() => mockRefreshScheduleStateFn),
}));

const ctx: ApiRequestContext = {
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'test-user',
};

const controlId = 'control-1';

const getLatestTestResultMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<ScheduleDataAccess, 'getLatestTestResult'> = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestTestResult: getLatestTestResultMock,
};

const refreshControlScheduleState =
  createRefreshControlScheduleState(mockDataAccess);

describe('refreshControlScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches latest test result and delegates with TestDate', async () => {
    getLatestTestResultMock.mockResolvedValue({
      Id: 'test-result-1',
      TestDate: '2024-05-15T00:00:00.000Z',
    });

    await refreshControlScheduleState(ctx, controlId);

    expect(getLatestTestResultMock).toHaveBeenCalledWith(ctx, controlId);
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: controlId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('handles no results (null)', async () => {
    getLatestTestResultMock.mockResolvedValue(null);

    await refreshControlScheduleState(ctx, controlId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: controlId,
      latestDate: null,
    });
  });
});
