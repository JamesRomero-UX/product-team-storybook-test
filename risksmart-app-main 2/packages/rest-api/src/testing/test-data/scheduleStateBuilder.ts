import type { GetScheduleStateQuery } from 'generated/graphql';

type ScheduleState = GetScheduleStateQuery['schedule_state_by_pk'];
const defaultScheduledState: ScheduleState = {
  Id: '1',
  CreatedByUser: 'user1',
  ModifiedAtTimestamp: '',
  ModifiedByUser: 'usr1',
  OrgKey: '',
  OverdueDate: null,
  DueDate: null,
  LatestDate: null,
};

export const buildScheduleState = (
  scheduledState: Partial<ScheduleState> = {}
): ScheduleState => {
  return {
    ...defaultScheduledState,
    ...scheduledState,
  };
};
