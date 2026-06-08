import { RulebookEvent } from '@risksmart-app/events/src/types/common';
import {
  type OrgEvent,
  orgEventSchemas,
} from '@risksmart-app/events/src/types/org-events';

import { getLogger } from '../../utils/logger';
import { processor as processExternalObligationsUpdated } from './processors/external-obligations-updated';

const logger = getLogger();

export const routeEvent = async (event: OrgEvent<unknown>): Promise<void> => {
  const supportedEvent = orgEventSchemas.safeParse(event);

  if (!supportedEvent.success) {
    logger.warn('Unhandled org event type', { eventType: event.type });

    return;
  }

  switch (event.type) {
    case RulebookEvent.ExternalObligationsUpdated:
      await processExternalObligationsUpdated(supportedEvent.data);
      break;
  }
};
