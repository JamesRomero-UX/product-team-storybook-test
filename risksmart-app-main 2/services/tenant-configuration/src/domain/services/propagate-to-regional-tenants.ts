import { randomUUID } from 'node:crypto';

import type { SystemEvent } from '@risksmart-app/events/src/types/system-events';
import type {
  TenantEvent,
  TenantEventMetadata,
} from '@risksmart-app/events/src/types/tenant-events';

import { getLogger } from '../../logger';
import type { TenantConfig } from '../types';

const logger = getLogger();
interface Dependencies {
  getTenantConfigs: () => Promise<TenantConfig[]>;
  dispatchEvents: (events: TenantEvent<unknown>[]) => Promise<void>;
}

export const createPropagateToRegionalTenants = ({
  getTenantConfigs,
  dispatchEvents,
}: Dependencies) => {
  const execute = async (systemEvent: SystemEvent<unknown>) => {
    const events: TenantEvent<unknown>[] = [];

    const tenantConfigs = await getTenantConfigs();

    if (tenantConfigs.length === 0) {
      return;
    }

    for (const tenantConfig of tenantConfigs) {
      const metadata: TenantEventMetadata = {
        ...systemEvent.metadata,
        eventId: randomUUID(),
        tenant: tenantConfig.tenant,
        causationId: systemEvent.metadata.eventId,
      };

      events.push({
        type: systemEvent.type,
        data: systemEvent.data,
        metadata,
      });
    }

    await dispatchEvents(events);

    logger.info('Propagated event to regional tenants', {
      originalEventId: systemEvent.metadata.eventId,
      tenantCount: tenantConfigs.length,
    });
  };

  return { execute };
};
