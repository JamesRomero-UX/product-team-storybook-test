import type { EventBridgeEvent } from 'aws-lambda';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';

import type { EntityPermitProcessor } from '../types';

export const userRole: {
  name: string;
  entityPermitProcessor: EntityPermitProcessor;
} = {
  name: 'user_role',
  entityPermitProcessor: async <
    T extends {
      Id: string;
      UserId: string;
      RoleKey: string;
      OrgKey: string;
    },
  >(
    tenant: string,
    event: EventBridgeEvent<string, DataChangeEvent<T, 'action'>>
  ) => {
    const entity = event.detail.event.data.new ?? event.detail.event.data.old;
    if (!entity) {
      throw new Error('No entity');
    }

    return {
      Id: entity.Id,
      UserId: entity.UserId,
      RoleKey: entity.RoleKey,
      OrgKey: entity.OrgKey,
      OP: event.detail.event.op,
      PermitAction: 'USER-ROLE',
    };
  },
};
