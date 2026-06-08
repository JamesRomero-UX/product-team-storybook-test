import type { IndicatorResult } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<IndicatorResult, 'indicator_result'>,
  void
>(async (e) => {
  const event = e.detail.event;
  const session = getSessionData(event?.session_variables);
  const { ctx, refreshIndicatorScheduleState } = createScheduleRefresh(session);
  logger.appendKeys({
    ...session,
  });
  const result = event.data.new ?? event.data.old;

  if (!result.IndicatorId) {
    throw new Error('Indicator Id not found');
  }

  logger.appendKeys({
    indicatorId: result.IndicatorId,
    indicatorResultId: result.Id,
  });

  await refreshIndicatorScheduleState(ctx, result.IndicatorId);
});
