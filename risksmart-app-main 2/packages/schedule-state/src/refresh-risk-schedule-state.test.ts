import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ScheduleDataAccess } from './ports/schedule-data-access';
import { createRefreshRiskImpactScheduleState } from './refresh-risk-impact-schedule-state';
import { createRefreshRiskRatingScheduleState } from './refresh-risk-rating-schedule-state';
import { createRefreshRiskScheduleState } from './refresh-risk-schedule-state';
import type { ApiRequestContext } from './types';

const mockRatingFn = vi.fn();
const mockImpactFn = vi.fn();

vi.mock('./refresh-risk-rating-schedule-state', () => ({
  createRefreshRiskRatingScheduleState: vi.fn(() => mockRatingFn),
}));

vi.mock('./refresh-risk-impact-schedule-state', () => ({
  createRefreshRiskImpactScheduleState: vi.fn(() => mockImpactFn),
}));

const ctx: ApiRequestContext = {
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'test-user',
};

const riskId = 'risk-1';

const mockDataAccess: ScheduleDataAccess = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestRiskAssessmentResult: vi.fn(),
  getAggregationSettings: vi.fn(),
  getLatestTestResult: vi.fn(),
  getLatestDocumentAssessmentResult: vi.fn(),
  getLatestObligationAssessmentResult: vi.fn(),
  getLatestIndicatorResult: vi.fn(),
  getOldestActiveImpactTestDate: vi.fn(),
};

const refreshRiskScheduleState = createRefreshRiskScheduleState(mockDataAccess);

describe('refreshRiskScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshRiskRatingScheduleState).mockReturnValue(
      mockRatingFn
    );
    vi.mocked(createRefreshRiskImpactScheduleState).mockReturnValue(
      mockImpactFn
    );
  });

  it('delegates to refreshRiskImpactScheduleState when useImpacts is true', async () => {
    await refreshRiskScheduleState(ctx, riskId, { useImpacts: true });

    expect(mockImpactFn).toHaveBeenCalledWith(ctx, riskId);
    expect(mockRatingFn).not.toHaveBeenCalled();
  });

  it('delegates to refreshRiskRatingScheduleState when useImpacts is false', async () => {
    await refreshRiskScheduleState(ctx, riskId, { useImpacts: false });

    expect(mockRatingFn).toHaveBeenCalledWith(ctx, riskId);
    expect(mockImpactFn).not.toHaveBeenCalled();
  });
});
