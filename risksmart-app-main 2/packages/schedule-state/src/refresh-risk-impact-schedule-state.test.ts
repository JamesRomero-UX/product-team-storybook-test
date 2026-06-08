import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshRiskImpactScheduleState } from './refresh-risk-impact-schedule-state';
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

const riskId = 'risk-1';

const getOldestActiveImpactTestDateMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<ScheduleDataAccess, 'getOldestActiveImpactTestDate'> = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getOldestActiveImpactTestDate: getOldestActiveImpactTestDateMock,
};

const refreshRiskImpactScheduleState =
  createRefreshRiskImpactScheduleState(mockDataAccess);

describe('refreshRiskImpactScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches oldest active impact test date and delegates to refreshScheduleState', async () => {
    getOldestActiveImpactTestDateMock.mockResolvedValue({
      oldestTestDate: '2024-05-10T00:00:00.000Z',
    });

    await refreshRiskImpactScheduleState(ctx, riskId);

    expect(getOldestActiveImpactTestDateMock).toHaveBeenCalledWith(ctx, riskId);
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: '2024-05-10T00:00:00.000Z',
    });
  });

  it('handles null oldest test date', async () => {
    getOldestActiveImpactTestDateMock.mockResolvedValue({
      oldestTestDate: null,
    });

    await refreshRiskImpactScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: null,
    });
  });
});
