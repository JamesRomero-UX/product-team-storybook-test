import dayjs from 'dayjs';
import _ from 'lodash';

interface OrgObject {
  Id: string;
  OrgKey: string;
}

export type ScheduleTimepoint =
  | {
      type: 'percentage';
      value: number;
    }
  | {
      type: 'relative';
      days: number;
    };

export interface ProcessScheduledDueDateNotificationsOptions<
  T extends OrgObject,
> {
  data: T[];
  dueDates: ScheduleTimepoint[];
  startDateGetter: (record: T) => string;
  dueDateGetter: (record: T) => string;
}

export interface ReminderDetail<T extends OrgObject> {
  objectId: string;
  objectData: T;
  timepoint: ScheduleTimepoint;
}

export const processScheduledDueDateNotifications = <T extends OrgObject>(
  {
    data,
    dueDates,
    startDateGetter,
    dueDateGetter,
  }: ProcessScheduledDueDateNotificationsOptions<T>,
  currentHour: dayjs.Dayjs
): ReminderDetail<T>[] => {
  const expiryInfo = data.map((r) => {
    // get all expiry dates
    const expiresAtDates = dueDates.map((interval) => {
      const expiryDate =
        interval.type === 'percentage'
          ? dayjs(startDateGetter(r)).add(
              dayjs(dueDateGetter(r)).diff(dayjs(startDateGetter(r)), 'ms') *
                interval.value,
              'ms'
            )
          : dayjs(dueDateGetter(r)).subtract(interval.days, 'days');

      return {
        interval,
        expiryDate,
      };
    });

    const timepoint = _.sortBy(expiresAtDates, (d) =>
      d.expiryDate.toISOString()
    ).find((d) => {
      return currentHour.isSame(d.expiryDate, 'hour');
    });

    return { ...r, timepoint: timepoint?.interval };
  });

  return expiryInfo
    .filter((r) => r.timepoint)
    .map((r) => ({
      objectId: r.Id,
      objectData: r,
      timepoint: r.timepoint!,
    }));
};
