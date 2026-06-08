import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const authUser: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'user',
  entityPermitProcessor: async <T extends { Id: string }>(
    tenant: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.Id,
      OP: event.detail.event.op,
      PermitAction: 'USER',
    };
  },
};
