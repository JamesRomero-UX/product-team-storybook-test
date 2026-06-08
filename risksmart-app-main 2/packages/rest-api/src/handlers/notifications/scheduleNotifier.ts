import type { ParentTypeEnum } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';

import type {
  EventDetail,
  Meta,
  RisksmartDetailType,
} from './eventBridgeUtils';
import { processScheduleNotifications } from './processScheduleNotifications';

export type ScheduleEventDetail = EventDetail<
  Meta,
  {
    DateDue: string;
    OrgKey: string;
    Id: string;
    Title: string;
    SequentialId: number;
    ObjectType: ParentTypeEnum;
    /**
     * The schedule due event is send twice.
     * This number keeps the event content unique for Idempotency checks
     */
    ReminderNo: number;
  }
>;

export const handler = eventBridgeEventHandler<
  RisksmartDetailType.ScheduleDue | RisksmartDetailType.ScheduleOverdue,
  ScheduleEventDetail,
  void
>(async (e) => {
  await processScheduleNotifications(e);
});
