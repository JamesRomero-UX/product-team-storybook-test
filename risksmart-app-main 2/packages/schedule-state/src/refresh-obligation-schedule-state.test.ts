import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshObligationScheduleState } from './refresh-obligation-schedule-state';
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

const obligationId = 'obligation-1';

const getLatestObligationAssessmentResultMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<ScheduleDataAccess, 'getLatestObligationAssessmentResult'> = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestObligationAssessmentResult: getLatestObligationAssessmentResultMock,
};

const refreshObligationScheduleState =
  createRefreshObligationScheduleState(mockDataAccess);

describe('refreshObligationScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches latest obligation assessment result and delegates with TestDate', async () => {
    getLatestObligationAssessmentResultMock.mockResolvedValue({
      Id: 'obligation-result-1',
      TestDate: '2024-05-15T00:00:00.000Z',
    });

    await refreshObligationScheduleState(ctx, obligationId);

    expect(getLatestObligationAssessmentResultMock).toHaveBeenCalledWith(
      ctx,
      obligationId
    );
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: obligationId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('handles no results (null)', async () => {
    getLatestObligationAssessmentResultMock.mockResolvedValue(null);

    await refreshObligationScheduleState(ctx, obligationId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: obligationId,
      latestDate: null,
    });
  });
});
