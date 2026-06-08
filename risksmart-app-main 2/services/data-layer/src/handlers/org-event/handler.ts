import type { EventType } from '@risksmart-app/events/src/types/common';
import {
  type OrgEvent,
  orgEventSchema,
} from '@risksmart-app/events/src/types/org-events';
import type { EventBridgeHandler } from 'aws-lambda';

import { getLogger } from '../../utils/logger';
import { routeEvent } from './router';

const logger = getLogger();

export const handler: EventBridgeHandler<
  EventType,
  OrgEvent<unknown>,
  void
> = async (event) => {
  logger.info('Received org event', {
    detailType: event['detail-type'],
    detail: event.detail,
    id: event.id,
    source: event.source,
  });

  const parseResult = orgEventSchema.safeParse(event.detail);

  if (!parseResult.success) {
    logger.error('Invalid org event detail', {
      errors: parseResult.error.errors,
    });
    throw new Error('Invalid org event detail');
  }

  await routeEvent(parseResult.data);
};
