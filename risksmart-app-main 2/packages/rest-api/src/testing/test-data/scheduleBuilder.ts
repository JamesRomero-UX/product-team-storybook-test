import type { SchedulePartsFragment } from 'generated/graphql';

const defaultScheduled: SchedulePartsFragment = {
  Id: '1',
};

export const buildSchedule = (
  schedule: Partial<SchedulePartsFragment> = {}
): SchedulePartsFragment => {
  return {
    ...defaultScheduled,
    ...schedule,
  };
};
