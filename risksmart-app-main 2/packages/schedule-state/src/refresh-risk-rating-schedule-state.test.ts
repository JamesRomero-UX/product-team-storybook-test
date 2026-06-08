import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshRiskRatingScheduleState } from './refresh-risk-rating-schedule-state';
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

const getLatestRiskAssessmentResultMock = vi.fn();
const getAggregationSettingsMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<
    ScheduleDataAccess,
    'getLatestRiskAssessmentResult' | 'getAggregationSettings'
  > = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestRiskAssessmentResult: getLatestRiskAssessmentResultMock,
  getAggregationSettings: getAggregationSettingsMock,
};

const refreshRiskRatingScheduleState =
  createRefreshRiskRatingScheduleState(mockDataAccess);

describe('refreshRiskRatingScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches latest assessment result and delegates to refreshScheduleState with TestDate', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Uncontrolled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: null,
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(getLatestRiskAssessmentResultMock).toHaveBeenCalledWith(ctx, riskId);
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('skips when controlled and ControlEffectivenessAverages scoring', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Controlled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: 'ControlEffectivenessAverages',
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).not.toHaveBeenCalled();
  });

  it('skips when controlled and NumberOfControlsWithGaps scoring', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Controlled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: 'NumberOfControlsWithGaps',
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).not.toHaveBeenCalled();
  });

  it('proceeds when controlled but different scoring model', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Controlled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: 'SomeOtherModel',
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('proceeds when uncontrolled regardless of scoring model', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Uncontrolled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: 'ControlEffectivenessAverages',
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('handles no assessment results (latestDate = null)', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue(null);
    getAggregationSettingsMock.mockResolvedValue({
      RiskScoringModel: null,
      Appetite: null,
      OrgKey: 'test-org',
      Config: null,
    });

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: null,
    });
  });

  it('handles no aggregation settings', async () => {
    getLatestRiskAssessmentResultMock.mockResolvedValue({
      Id: 'result-1',
      Impact: 3,
      Likelihood: 4,
      Rating: 12,
      ControlType: 'Controlled',
      TestDate: '2024-05-15T00:00:00.000Z',
    });
    getAggregationSettingsMock.mockResolvedValue(null);

    await refreshRiskRatingScheduleState(ctx, riskId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: riskId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });
});
