import type { EventType } from '@risksmart-app/events/src/types/common';
import type { SystemEvent } from '@risksmart-app/events/src/types/system-events';
import { systemEventSchema } from '@risksmart-app/events/src/types/system-events';
import type { EventBridgeHandler } from 'aws-lambda';

import { getAllTenantConfigs } from '../../adaptors/database/tenant-config';
import { createAdaptor as createEventBridgeAdaptor } from '../../adaptors/event-bridge-adaptor';
import { createPropagateToRegionalTenants } from '../../domain/services/propagate-to-regional-tenants';
import { getEnv } from '../../environment';
import { getLogger } from '../../logger';

const logger = getLogger();

export const handler: EventBridgeHandler<
  EventType,
  SystemEvent<unknown>,
  void
> = async (event) => {
  const validation = systemEventSchema.safeParse(event.detail);

  if (!validation.success) {
    logger.error('Invalid system event received', {
      eventId: event.id,
      errors: validation.error.errors,
      detail: event.detail,
    });
    throw new Error(`Invalid system event: ${validation.error.message}`);
  }

  const region = getEnv('AWS_REGION');
  const eventBusName = getEnv('EVENT_BUS_NAME');

  const eventBridgeAdaptor = createEventBridgeAdaptor({
    eventBusName,
    source: 'risksmart.tenant-event-propagation',
    detailType: event['detail-type'],
  });

  const getTenantConfigs = () => getAllTenantConfigs(region);

  const propagateToRegionalTenants = createPropagateToRegionalTenants({
    getTenantConfigs: getTenantConfigs,
    dispatchEvents: eventBridgeAdaptor.dispatchEvents,
  });

  await propagateToRegionalTenants.execute(validation.data);
};
