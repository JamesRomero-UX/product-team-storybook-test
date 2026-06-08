import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const userGroup: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'user_group',
  entityPermitProcessor: async <T extends { OrgKey: string; Id: string }>(
    _: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.Id,
      OP: event.detail.event.op,
      OrgKey: entity.OrgKey,
      EntityType: 'user_group',
      PermitAction: 'GROUP',
    };
  },
};
