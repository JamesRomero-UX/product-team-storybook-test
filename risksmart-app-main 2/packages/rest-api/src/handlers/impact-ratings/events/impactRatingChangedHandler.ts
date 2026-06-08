import type { ImpactRating } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getSessionData } from 'src/session';

import { getLogger } from '../../../logger';
import type { DataChangeEvent } from '../../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<ImpactRating, 'impact_rating'>,
  void
>(async (event) => {
  if (event.detail.table.name !== 'impact_rating') {
    logger.error(`Unsupported table`, event.detail.table.name);

    return;
  }
  if (!['UPDATE', 'INSERT'].includes(event.detail.event.op)) {
    logger.error(`Unsupported op`, event.detail.event.op);

    return;
  }
  const sessionData = getSessionData(event.detail.event.session_variables);
  const { ctx, refreshRiskImpactScheduleState } =
    createScheduleRefresh(sessionData);
  logger.appendKeys({
    ...sessionData,
  });

  const ratedItemId = event.detail.event.data.new?.RatedItemId;
  if (!ratedItemId) {
    throw new Error(`Missing ratedItemId`);
  }

  await refreshRiskImpactScheduleState(ctx, ratedItemId);
});
