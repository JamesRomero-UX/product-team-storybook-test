import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BaseScheduleAccess,
  ScheduleDataAccess,
} from './ports/schedule-data-access';
import { createRefreshDocumentScheduleState } from './refresh-document-schedule-state';
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

const documentId = 'document-1';

const getLatestDocumentAssessmentResultMock = vi.fn();

const mockDataAccess: BaseScheduleAccess &
  Pick<ScheduleDataAccess, 'getLatestDocumentAssessmentResult'> = {
  getSchedule: vi.fn(),
  getScheduleState: vi.fn(),
  upsertScheduleState: vi.fn(),
  getLatestDocumentAssessmentResult: getLatestDocumentAssessmentResultMock,
};

const refreshDocumentScheduleState =
  createRefreshDocumentScheduleState(mockDataAccess);

describe('refreshDocumentScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createRefreshScheduleState).mockReturnValue(
      mockRefreshScheduleStateFn
    );
  });

  it('fetches latest document assessment result and delegates with TestDate', async () => {
    getLatestDocumentAssessmentResultMock.mockResolvedValue({
      Id: 'doc-result-1',
      TestDate: '2024-05-15T00:00:00.000Z',
    });

    await refreshDocumentScheduleState(ctx, documentId);

    expect(getLatestDocumentAssessmentResultMock).toHaveBeenCalledWith(
      ctx,
      documentId
    );
    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: documentId,
      latestDate: '2024-05-15T00:00:00.000Z',
    });
  });

  it('handles no results (null)', async () => {
    getLatestDocumentAssessmentResultMock.mockResolvedValue(null);

    await refreshDocumentScheduleState(ctx, documentId);

    expect(mockRefreshScheduleStateFn).toHaveBeenCalledWith(ctx, {
      entityId: documentId,
      latestDate: null,
    });
  });
});
