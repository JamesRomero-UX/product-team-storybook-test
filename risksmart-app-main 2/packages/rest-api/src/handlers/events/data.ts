import { captureMessage, setExtra } from '@sentry/aws-serverless';
import backendApiHandler from 'src/backendApiHandler';
import { getLogger } from 'src/logger';
import { getSessionData } from 'src/session';
import { EventBus } from 'sst/node/event-bus';
import { z } from 'zod';

import { sendToEventBridgeInBatches } from '../notifications/eventBridgeUtils';
import type { DataChangeEvent } from './DataChangeEvent';

const logger = getLogger();

export const handler = backendApiHandler<DataChangeEvent<unknown, string>>(
  z.any(),
  async (body) => {
    if (!body) {
      throw new Error('No body');
    }
    logger.appendKeys({ id: body.id });
    const sessionData = getSessionData(body.event.session_variables);
    if (!sessionData.tenant) {
      // useful just in case we introduce a bug where we aren't sending the tenant within the app
      // we can get the original payload from hdb_catalog.event_log, even get the event resent
      setExtra('hasuraEventId', body.id);
      const noTenantMessage =
        'No tenant available. Cannot continue. Event possibly firing due to a migration or ad hoc sql script';
      captureMessage(noTenantMessage, 'warning');
      logger.warn(noTenantMessage);

      // Strictly speaking the call wasn't successful, however, we have known cases where this can happen, and we don't need
      // hasura to retry and send the events in this instance.
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'successful' }),
      };
    }

    const details = {
      meta: { tenant: sessionData.tenant },
      ...body,
    };

    await sendToEventBridgeInBatches([
      {
        EventBusName: EventBus.SharedEventBus.eventBusName,
        Source: 'risksmart.dataEvent',
        DetailType: 'DataChanged',
        Detail: JSON.stringify(details),
      },
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'successful' }),
    };
  }
);
