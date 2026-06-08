import type { TestResult } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<TestResult, 'test_result'>,
  void
>(async (event) => {
  const item = event.detail.event.data.new ?? event.detail.event.data.old;

  logger.appendKeys({
    controlId: item.ParentControlId,
    testResultId: item.Id,
  });
  const session = getSessionData(event.detail.event?.session_variables);
  const { ctx, refreshControlScheduleState } = createScheduleRefresh(session);
  logger.appendKeys({
    ...session,
  });
  if (item.ParentControlId == undefined) {
    throw new Error('No control id on test result');
  }

  await refreshControlScheduleState(ctx, item.ParentControlId);
});
