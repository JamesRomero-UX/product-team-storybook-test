import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BaseScheduleAccess } from './ports/schedule-data-access';
import { createRefreshScheduleState } from './refresh-schedule-state';
import type { ApiRequestContext, Schedule, ScheduleState } from './types';

const ctx: ApiRequestContext = {
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'test-user',
};

const getScheduleMock = vi.fn();
const getScheduleStateMock = vi.fn();
const upsertScheduleStateMock = vi.fn();

const mockDataAccess: BaseScheduleAccess = {
  getSchedule: getScheduleMock,
  getScheduleState: getScheduleStateMock,
  upsertScheduleState: upsertScheduleStateMock,
};

const refreshScheduleState = createRefreshScheduleState(mockDataAccess);

describe('refreshScheduleState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getScheduleStateMock.mockResolvedValue(null);
  });

  it('returns early when no schedule found', async () => {
    getScheduleMock.mockResolvedValue(null);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(getScheduleMock).toHaveBeenCalledWith(ctx, 'entity-1');
    expect(upsertScheduleStateMock).not.toHaveBeenCalled();
  });

  it('calculates correct due date for adhoc frequency (uses ManualDueDate)', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'adhoc',
      ManualDueDate: '2024-06-01T00:00:00.000Z',
      StartDate: '2024-05-01T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-06-01T00:00:00.000Z',
      OverdueDate: null,
    });
  });

  it('calculates correct due date for recurring frequency', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: null,
    });
  });

  it('calculates overdue date correctly', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: 2,
      TimeToCompleteUnit: 'day',
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: '2024-05-18T00:00:00.000Z',
    });
  });

  it('skips upsert when state is unchanged', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    const existingState: ScheduleState = {
      Id: 'entity-1',
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: null,
    };
    getScheduleStateMock.mockResolvedValue(existingState);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).not.toHaveBeenCalled();
  });

  it('upserts when state changed', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    const existingState: ScheduleState = {
      Id: 'entity-1',
      LatestDate: '2024-05-10T00:00:00.000Z',
      DueDate: '2024-05-11T00:00:00.000Z',
      OverdueDate: null,
    };
    getScheduleStateMock.mockResolvedValue(existingState);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-05-16T00:00:00.000Z',
      OverdueDate: null,
    });
  });

  it('handles null latest date (no test results)', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: null,
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: null,
      DueDate: '2024-05-14T00:00:00.000Z',
      OverdueDate: null,
    });
  });

  it('uses startDate as dueDate when startDate is after latestDate', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: 'daily',
      ManualDueDate: null,
      StartDate: '2024-05-20T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: '2024-05-20T00:00:00.000Z',
      OverdueDate: null,
    });
  });

  it('sets dueDate to undefined when no frequency is set', async () => {
    const schedule: Schedule = {
      Id: 'entity-1',
      Frequency: null,
      ManualDueDate: null,
      StartDate: '2024-05-14T00:00:00.000Z',
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    };
    getScheduleMock.mockResolvedValue(schedule);

    await refreshScheduleState(ctx, {
      entityId: 'entity-1',
      latestDate: '2024-05-15T00:00:00.000Z',
    });

    expect(upsertScheduleStateMock).toHaveBeenCalledWith(ctx, 'entity-1', {
      LatestDate: '2024-05-15T00:00:00.000Z',
      DueDate: null,
      OverdueDate: null,
    });
  });
});
