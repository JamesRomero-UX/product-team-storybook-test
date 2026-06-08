import dayjs from 'dayjs';
import { vitest } from 'vitest';

import type { AttestationPartsFragment } from '../../../generated/graphql';
import {
  AttestationRecordStatusEnum,
  ParentTypeEnum,
} from '../../../generated/graphql';
import { stub } from '../../testing/stub';
import {
  processScheduledDueDateNotifications,
  type ScheduleTimepoint,
} from './scheduleUtilities';

const timepoints: ScheduleTimepoint[] = [
  { type: 'percentage', value: 0.5 },
  { type: 'relative', days: 3 },
  { type: 'relative', days: 2 },
  { type: 'relative', days: 1 },
];

describe('processScheduledDueDateNotifications', () => {
  let attestationMocks: (AttestationPartsFragment & { OrgKey: string })[];
  let now: dayjs.Dayjs;

  beforeEach(() => {
    vitest.useFakeTimers().setSystemTime(new Date('2023-01-10'));

    now = dayjs();

    attestationMocks = [
      // 50% of the way through the attestation period
      {
        Id: '1',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(10, 'days').toISOString(),
        ExpiresAt: now.add(10, 'days').toISOString(),
        UserId: '1',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 50% of the way through the attestation period
      {
        Id: '2',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(10, 'days').toISOString(),
        ExpiresAt: now.add(10, 'days').toISOString(),
        UserId: '2',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 1 day remaining
      {
        Id: '3',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(1, 'year').toISOString(),
        ExpiresAt: now.add(1, 'day').toISOString(),
        UserId: '2',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 0% of the way through the attestation period
      {
        Id: '4',
        NodeId: '2',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.toISOString(),
        ExpiresAt: now.add(14, 'days').toISOString(),
        UserId: '3',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 3 days remaining
      {
        Id: '5',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(1, 'year').toISOString(),
        ExpiresAt: now.add(3, 'days').toISOString(),
        UserId: '2',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 2 days remaining
      {
        Id: '6',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(1, 'year').toISOString(),
        ExpiresAt: now.add(2, 'days').toISOString(),
        UserId: '2',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
      // 1 day overdue
      {
        Id: '7',
        NodeId: '1',
        AttestationStatus: AttestationRecordStatusEnum.Pending,
        CreatedAtTimestamp: now.subtract(1, 'year').toISOString(),
        ExpiresAt: now.subtract(1, 'days').toISOString(),
        UserId: '2',
        OrgKey: '123',
        node: {
          ObjectType: ParentTypeEnum.Document,
        },
        Active: true,
      },
    ];
  });

  it('Should return the correct array of notifications for negative relative timepoints', () => {
    const records =
      stub<(AttestationPartsFragment & { OrgKey: string })[]>(attestationMocks);

    const result = processScheduledDueDateNotifications(
      {
        data: records,
        dueDates: [
          { type: 'relative', days: -1 },
          { type: 'relative', days: -2 },
          { type: 'relative', days: -7 },
          { type: 'relative', days: -30 },
        ],
        startDateGetter: (r) => r.CreatedAtTimestamp,
        dueDateGetter: (r) => r.ExpiresAt as string,
      },
      now.startOf('hour')
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '7',
        timepoint: {
          type: 'relative',
          days: -1,
        },
      })
    );
  });

  it('Should return the correct array of notifications for the given records', () => {
    const records =
      stub<(AttestationPartsFragment & { OrgKey: string })[]>(attestationMocks);

    const result = processScheduledDueDateNotifications(
      {
        data: records,
        dueDates: timepoints,
        startDateGetter: (r) => r.CreatedAtTimestamp,
        dueDateGetter: (r) => r.ExpiresAt as string,
      },
      now.startOf('hour')
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '1',
        timepoint: {
          type: 'percentage',
          value: 0.5,
        },
      })
    );
    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '2',
        timepoint: {
          type: 'percentage',
          value: 0.5,
        },
      })
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '3',
        timepoint: {
          type: 'relative',
          days: 1,
        },
      })
    );

    expect(result).not.toContainEqual(
      expect.objectContaining({
        objectId: '4',
      })
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '5',
        timepoint: {
          type: 'relative',
          days: 3,
        },
      })
    );

    expect(result).toContainEqual(
      expect.objectContaining({
        objectId: '6',
        timepoint: {
          type: 'relative',
          days: 2,
        },
      })
    );
  });

  it('Should return not send reminders when it is not the correct time', () => {
    const records =
      stub<(AttestationPartsFragment & { OrgKey: string })[]>(attestationMocks);

    const result = processScheduledDueDateNotifications(
      {
        data: records,
        dueDates: timepoints,
        startDateGetter: (r) => r.CreatedAtTimestamp,
        dueDateGetter: (r) => r.ExpiresAt as string,
      },
      now.add(5, 'hours').startOf('hour')
    );

    expect(result).toHaveLength(0);
  });
});
