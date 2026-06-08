import { randomUUID } from 'node:crypto';

import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import type { ServiceContext } from 'src/types';

export const createDefaultMetadata = (
  context: ServiceContext
): OrgUserEventMetadata => ({
  eventId: randomUUID(),
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  domain: 'risksmart.app',
  service: 'risksmart.data-layer',
  correlationId: context.correlationId ?? randomUUID(),
  tenant: context.tenant,
  orgKey: context.orgKey,
  userId: context.userId,
});
