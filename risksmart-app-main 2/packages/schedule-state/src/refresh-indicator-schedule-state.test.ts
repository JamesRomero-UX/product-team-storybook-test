import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshIndicatorScheduleState } from './refresh-indicator-schedule-state';
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

const indicatorId = 'indicator-1';

const getLatestIndicatorResultMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<ScheduleDataAccess, 'getLatestIndicatorResult'> = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestIndicatorResult: getLatestIndicatorResultMock,
};

const refreshIndicatorScheduleState =
  createRefreshIndicatorScheduleState(mockDataAccess);

describe('refreshIndicatorScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches latest indicator result and delegates with ResultDate (not TestDate)', async () => {
    getLatestIndicatorResultMock.mockResolvedValue({
      Id: 'indicator-result-1',
      ResultDate: '2024-05-15T00:00:00.000Z',
    });

    await refreshIndicatorScheduleState(ctx, indicatorId);

    expect(getLatestIndicatorResultMock).toHaveBeenCalledWith(ctx, indicatorId);
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: indicatorId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('handles no results (null)', async () => {
    getLatestIndicatorResultMock.mockResolvedValue(null);

    await refreshIndicatorScheduleState(ctx, indicatorId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: indicatorId,
      latestDate: null,
    });
  });
});
